import { Sequelize, DataTypes, Model } from 'sequelize';

// Configuração da conexão com PostgreSQL
const sequelize = new Sequelize('tecnospeed', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
});

// Função para gerar um modelo dinamicamente com base na instituição
function createBankTables(bankName: string) {
    // Modelo para Registro
    const Registro = sequelize.define(`${bankName}_Registro`, {
        status: {
            type: DataTypes.STRING,
            allowNull: false, // "online" ou "offline"
        },
        responseTime: {
            type: DataTypes.FLOAT, // Tempo de resposta em segundos
            allowNull: true,
        },
        responseStatus: {
            type: DataTypes.INTEGER, // Código de status HTTP
            allowNull: true,
        },
        error: {
            type: DataTypes.STRING, // Descrição do erro, se houver
            allowNull: true,
        }
    }, {
        tableName: `${bankName}_Registro`,
        timestamps: true, // createdAt vai registrar o horário do teste
    });

    // Modelo para Consulta
    const Consulta = sequelize.define(`${bankName}_Consulta`, {
        status: {
            type: DataTypes.STRING,
            allowNull: false, // "online" ou "offline"
        },
        responseTime: {
            type: DataTypes.FLOAT, // Tempo de resposta em segundos
            allowNull: true,
        },
        responseStatus: {
            type: DataTypes.INTEGER, // Código de status HTTP
            allowNull: true,
        },
        error: {
            type: DataTypes.STRING, // Descrição do erro, se houver
            allowNull: true,
        }
    }, {
        tableName: `${bankName}_Consulta`,
        timestamps: true, // createdAt vai registrar o horário do teste
    });

    return { Registro, Consulta };
}

// Função para sincronizar todas as tabelas do banco
async function syncDatabase() {
    await sequelize.sync();
}

export { createBankTables, syncDatabase };
