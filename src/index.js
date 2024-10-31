import { syncDatabase } from './database'; // Importa a função de sincronização do banco de dados
import app from './server'; // Importa o servidor configurado no arquivo server.ts

const port = process.env.PORT || 5432; // Define a porta do servidor (usa variável de ambiente se disponível, senão 3000)

// Sincroniza o banco de dados e inicia o servidor
syncDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    })
    .catch((error) => {
        console.error('Erro ao iniciar o servidor:', error);
    });
