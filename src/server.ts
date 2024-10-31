import express from 'express';
import axios, { AxiosError } from 'axios';
import { createBankTables, syncDatabase } from './database';

const app = express();
const port = 5432;

// Lista de status considerados "positivos"
const positiveStatuses = [200, 400, 401, 403, 422];
// Lista de erros considerados "negativos"
const negativeErrors = ['ECONNRESET', 'EHOSTUNREACH', 'ETIMEDOUT'];

// Função para monitorar a API
async function monitorAPI(url: string, bankName: string, tableType: 'Registro' | 'Consulta') {
    // Cria tabelas para o banco específico
    const { Registro, Consulta } = createBankTables(bankName);
    const Table = tableType === 'Registro' ? Registro : Consulta;

    const startTime = Date.now(); // Início do tempo de resposta

    try {
        const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5 segundos
        const responseTime = (Date.now() - startTime) / 1000; // Tempo de resposta em segundos

        const statusResult = positiveStatuses.includes(response.status) ? 'online' : 'offline';

        console.log(`Resultado: ${statusResult} | Status: ${response.status} | Tempo: ${responseTime}s`);

        // Salva no banco de dados o resultado
        await Table.create({
            status: statusResult,
            responseTime: responseTime,
            responseStatus: response.status,
            error: null,
        });

        return { status: statusResult, responseStatus: response.status, responseTime: responseTime };

    } catch (error: any) {
        const responseTime = (Date.now() - startTime) / 1000;
        let errorMsg = '';
        let errCode = null;
        let statusResult = 'offline';

        if (error instanceof AxiosError) {
            errCode = error.code || '';
            if (negativeErrors.includes(errCode)) {
                errorMsg = `Erro negativo detectado: ${errCode}`;
            } else if (error.response) {
                const status = error.response.status;
                if (status === 500 || status === 504) {
                    errorMsg = `Erro de servidor: Status ${status}`;
                }
            } else if (error.message.includes('timeout')) {
                errorMsg = 'Erro de timeout: muito lento ou timeout';
            }
        }

        if (!errorMsg) {
            errorMsg = `Erro desconhecido: ${error.message}`;
        }

        console.log(`Resultado: ${statusResult} | Erro: ${errorMsg} | Tempo: ${responseTime}s`);

        // Salva o erro no banco de dados
        await Table.create({
            status: statusResult,
            responseTime: responseTime,
            responseStatus: null,
            error: errorMsg,
        });

        return { status: statusResult, error: errorMsg, responseTime: responseTime };
    }
}

// Rota para monitorar o envio e consulta de boletos
app.get('/monitor/:bank/:type', async (req, res) => {
    const bankName = req.params.bank; // Exemplo: 'BB' (Banco do Brasil)
    const tableType = req.params.type as 'Registro' | 'Consulta'; // Exemplo: 'Registro' ou 'Consulta'
    const apiUrl = 'https://api.banco.com/consulta-boleto'; // Substitua pela URL real da API bancária

    const result = await monitorAPI(apiUrl, bankName, tableType);
    res.json(result);
});

// Rota para exibir o histórico de logs por banco e tipo
app.get('/logs/:bank/:type', async (req, res) => {
    const bankName = req.params.bank;
    const tableType = req.params.type as 'Registro' | 'Consulta';
    const { Registro, Consulta } = createBankTables(bankName);
    const Table = tableType === 'Registro' ? Registro : Consulta;

    const logs = await Table.findAll({
        order: [['createdAt', 'DESC']],
    });

    res.json(logs);
});

// Inicia o banco de dados e o servidor
syncDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
});
