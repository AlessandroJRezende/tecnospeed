"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importStar(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
// Lista de status considerados "positivos"
const positiveStatuses = [200, 400, 401, 403, 422];
// Lista de erros considerados "negativos"
const negativeErrors = ['ECONNRESET', 'EHOSTUNREACH', 'ETIMEDOUT'];
// Função para monitorar a API
function monitorAPI(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, { timeout: 5000 }); // Timeout de 5 segundos
            // Verifica se o status é positivo ou negativo
            if (positiveStatuses.includes(response.status)) {
                console.log(`Positivo: Status ${response.status}`);
                return { status: "positivo", responseStatus: response.status };
            }
            else {
                console.log(`Negativo: Status ${response.status}`);
                return { status: "negativo", responseStatus: response.status };
            }
        }
        catch (error) {
            // Identifica erros específicos
            if (error instanceof axios_1.AxiosError) {
                const errCode = error.code || '';
                if (negativeErrors.includes(errCode)) {
                    console.log(`Erro negativo detectado: ${errCode}`);
                    return { status: "negativo", error: errCode };
                }
                // Tratar status de erro como 500 ou 504
                if (error.response) {
                    const status = error.response.status;
                    if (status === 500 || status === 504) {
                        console.log(`Erro de servidor: Status ${status}`);
                        return { status: "negativo", responseStatus: status };
                    }
                }
                if (error.message.includes('timeout')) {
                    console.log(`Erro de timeout: muito lento ou timeout`);
                    return { status: "negativo", error: "timeout ou lento" };
                }
            }
            console.log(`Erro desconhecido: ${error.message}`);
            return { status: "negativo", error: error.message };
        }
    });
}
// Rota para monitorar o envio e consulta de boletos
app.get('/monitor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const apiUrl = 'https://api.banco.com/consulta-boleto'; // Substitua pela URL real da API bancária
    const result = yield monitorAPI(apiUrl);
    res.json(result);
}));
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
