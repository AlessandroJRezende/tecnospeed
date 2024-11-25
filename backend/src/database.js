const { Sequelize } = require('sequelize');

// Configuração do Sequelize
const sequelize = new Sequelize('tecnospeed', 'postgres', 'postgres', {
    host: 'localhost', // Altere se estiver usando outro host
    dialect: 'postgres', // Define o banco como PostgreSQL
    logging: false, // Desativa logs no console
});

module.exports = sequelize;
