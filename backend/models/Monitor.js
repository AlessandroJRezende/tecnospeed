const { DataTypes } = require('sequelize');
const sequelize = require('../src/database');

function createBankTables(bankName) {
    // Tabela para Registro de Boletos
    const Registro = sequelize.define(`${bankName}_Registro`, {
        horario: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        resultado: {
            type: DataTypes.STRING, // "online" ou "offline"
            allowNull: false,
        },
        status_code: {
            type: DataTypes.INTEGER, // Http status code
            allowNull: false,
        },
        tempo_resposta: {
            type: DataTypes.FLOAT, // Tempo em segundos
            allowNull: false,
        },
    });

    // Tabela para Consulta de Boletos
    const Consulta = sequelize.define(`${bankName}_Consulta`, {
        horario: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        resultado: {
            type: DataTypes.STRING, // "online" ou "offline"
            allowNull: false,
        },
        status_code: {
            type: DataTypes.INTEGER, // Http status code
            allowNull: false,
        },
        tempo_resposta: {
            type: DataTypes.FLOAT, // Tempo em segundos
            allowNull: false,
        },
    });

    return { Registro, Consulta };
}

module.exports = { createBankTables };
