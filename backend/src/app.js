const express = require('express');
const sequelize = require('./database');
const axios = require('axios');
const { monitorarAPI } = require('../services/monitorService');
const { createBankTables } = require('../models/Monitor');

const app = express();
app.use(express.json());

// Sincronização com o Banco
sequelize.sync({ force: false }).then(() => {
    console.log('Banco de dados sincronizado!');
});

// Endpoint para monitorar APIs
app.post('/monitor/', async (req, res) => {
    try {
        const { endpoint, dados } = req.body;
        console.log('Requisição recebida:', req.body);

        const resultado = await monitorarAPI(endpoint, dados);
        console.log('Resultado obtido:', resultado);

        res.json(resultado);
    } catch (error) {
        console.error('Erro desconhecido:', error);
        res.status(500).json({ error: 'Erro interno do servidor', detalhes: error.message });
    }
});

// Requisição get para buscar o histórico de consulta de boletos
app.get('/boleto-data/consulta/:bank', async (req, res) => {
    try {
        const bankName = req.params.bank;
        const { Consulta } = createBankTables(bankName);
        const consulta = await Consulta.findAll();

        res.status(200).json(consulta); // Retorna os dados no formato JSON
    } catch (error) {
        console.error('Erro ao buscar consulta:', error);
        res.status(500).json({ erro: 'Erro ao buscar consulta' });
    }
});

// Requisição get para buscar o histórico de registro de boletos
app.get('/boleto-data/registro/:bank', async (req, res) => {
    try {
        const bankName = req.params.bank;
        const { Registro } = createBankTables(bankName);
        const registro = await Registro.findAll();

        res.status(200).json(registro); // Retorna os dados no formato JSON
    } catch (error) {
        console.error('Erro ao buscar registro:', error);
        res.status(500).json({ erro: 'Erro ao buscar registro' });
    }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
