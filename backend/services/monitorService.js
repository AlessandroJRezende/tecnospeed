const { Json } = require('sequelize/lib/utils');
const { createBankTables } = require('../models/Monitor');
const axios = require('axios');

axios.defaults.headers.common['token-sh'] = 'a60c428fbfcafa73bc8eda5e9b7fee4e';
axios.defaults.headers.common['cnpj-sh'] = '12067625000150';
axios.defaults.headers.common['cnpj-cedente'] = '74447314000173';

// Função para verificar a API
async function monitorarAPI(endpoint, dados) {

    const inicio = Date.now();

    try {

        const { tipo, codBank, resposta } = await processarBoleto(endpoint, dados);

        const bankName = identificarBanco(codBank);

        const { Registro, Consulta } = createBankTables(bankName);
        const statusCode = resposta.status;
        const onlineMotivo = resposta.statusText;
        const tempoResposta = (Date.now() - inicio) / 1000;

        const resultado = [200, 400, 401, 403, 422].includes(resposta.status)
            ? 'online'
            : 'offline';


        await salvarResultado(tipo, Registro, Consulta, {
            horario: new Date(),
            status_code: statusCode,
            resultado: resultado + ` (${onlineMotivo})`,
            tempo_resposta: tempoResposta,
        });

        return { status: resultado, tempoResposta };
    } catch (erro) {
        const tempoResposta = (Date.now() - inicio) / 1000;
        const statusCode = erro.response?.status || 'ERRO_DESCONHECIDO';
        const offlineMotivo =
            erro.code || erro.response?.status || 'ERRO_DESCONHECIDO';

        await salvarResultado(tipo, Registro, Consulta, {
            horario: new Date(),
            status_code: statusCode,
            resultado: `offline (${offlineMotivo})`,
            tempo_resposta: tempoResposta,
        });

        return { status: 'offline', motivo: offlineMotivo, tempoResposta };
    }
}

// Função para salvar resultado no banco
async function salvarResultado(tipo, Registro, Consulta, dados) {
    if (tipo === 'registro') {
        await Registro.create(dados);
    } else if (tipo === 'consulta') {
        await Consulta.create(dados);
    }
}


// Verificar se é uma consulta ou registro de boleto
async function processarBoleto(endpoint, dados) {
    let tipo, codBank, resposta;

    if (endpoint.includes('idintegracao=')) {
        tipo = 'consulta';
        resposta = await consultarBoleto(endpoint);
        codBank = resposta.data._dados[0].CedenteCodigoBanco;
    } else if (endpoint.includes('/boletos')) {
        tipo = 'registro';
        resposta = await registrarBoleto(endpoint, dados);
        codBank = resposta.data._dados.CedenteContaCodigoBanco;
    }

    return { tipo, codBank, resposta };
}

async function consultarBoleto(endpoint) {
    const resposta = await axios.get(endpoint, { timeout: 5000 });
    return resposta;
}

async function registrarBoleto(endpoint, dados) {
    const resposta = await axios.post(endpoint, {
        CedenteContaNumero: dados.CedenteContaNumero,
        CedenteContaNumeroDV: dados.CedenteContaNumeroDV,
        CedenteConvenioNumero: dados.CedenteConvenioNumero,
        CedenteContaCodigoBanco: dados.CedenteContaCodigoBanco,
        SacadoCPFCNPJ: dados.SacadoCPFCNPJ,
        SacadoEmail: dados.SacadoEmail,
        SacadoEnderecoNumero: dados.SacadoEnderecoNumero,
        SacadoEnderecoBairro: dados.SacadoEnderecoBairro,
        SacadoEnderecoCEP: dados.SacadoEnderecoCEP,
        SacadoEnderecoCidade: dados.SacadoEnderecoCidade,
        SacadoEnderecoComplemento: dados.SacadoEnderecoComplemento,
        SacadoEnderecoLogradouro: dados.SacadoEnderecoLogradouro,
        SacadoEnderecoPais: dados.SacadoEnderecoPais,
        SacadoEnderecoUF: dados.SacadoEnderecoUF,
        SacadoNome: dados.SacadoNome,
        SacadoTelefone: dados.SacadoTelefone,
        SacadoCelular: dados.SacadoCelular,
        TituloDataDesconto: dados.TituloDataDesconto,
        TituloValorDesconto: dados.TituloValorDesconto,
        TituloDataEmissao: dados.TituloDataEmissao,
        TituloDataVencimento: dados.TituloDataVencimento,
        TituloValorJuros: dados.TituloValorJuros,
        TituloPrazoProtesto: dados.TituloPrazoProtesto,
        TituloMensagem01: dados.TituloMensagem01,
        TituloMensagem02: dados.TituloMensagem02,
        TituloMensagem03: dados.TituloMensagem03,
        TituloNossoNumero: dados.TituloNossoNumero,
        TituloNumeroDocumento: dados.TituloNumeroDocumento,
        TituloValor: dados.TituloValor,
        TituloLocalPagamento: dados.TituloLocalPagamento
    });
    return resposta;
}

function identificarBanco(codigo) {
    switch (codigo) {
        case '001':
            return 'BB';
        case '033':
            return 'Santander';
        default:
            return 'Código de banco desconhecido';
    }
}

module.exports = { monitorarAPI };
