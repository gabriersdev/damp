"use strict";

// Importando todas as funções exportadas no arquivo functions.js e add. globalmente
import * as exports from "./publicFunctions.js"
import { limparFormDamp, ajustarLarguraInputAoConteudo } from "./lib.js"

Object.entries(exports).forEach(([name, exported]) => window[name] = exported);

// Importando
import {
  salvarRegistro,
  apagarRegistroSalvo,
  carregarRegistros,
  recuperarRegistroSalvo,
  recuperarDados,
  exportarRegistrosArmazenados,
} from "./dataBaseFunctions.js";
import { controlePreenchimentoAnosIR, vercpf } from "./publicFunctions.js";

(() => {
  // Apresentação do Projeto no console
  const dados_do_projeto = {
    "Project name": "DAMP",
    "Developed by": "Gabriel Ribeiro",
    "Version": "3.0.0",
    "Release date": "2023-12-25",
    "Hostname": new URL(window.location).hostname,
    "Origin": new URL(window.location).origin,
    "Status": "Active"
  };

  const novas_funcionalidades = [
    "Compartilhamento de link de DAMP: é possível gerar um link para uma DAMP feita e armazenada no navegador e compartilhar o link com outras pessoas para gerar a mesma DAMP. Há uma limitação dos navegadores quanto a quantidade de caracteres de uma URL, por isso em alguns casos dados podem ser perdidos.",
    "Falha na recuperação de dados corrigida: alguns campos de checkbox não eram devidamente apresentados na recuperação dos registros. O erro foi corrigido nesta versão."
  ];

  Object.freeze(novas_funcionalidades);
  Object.freeze(dados_do_projeto);

  // Exibindo dados
  console.groupCollapsed(`${dados_do_projeto["Project name"]}, Version ${dados_do_projeto["Version"]}`);
  console.table(dados_do_projeto);
  console.groupEnd();

  console.groupCollapsed('New features');
  novas_funcionalidades.toSorted((a, b) => a.localeCompare(b)).forEach((feature) => {
    console.info(`${feature}`)
  });
  console.groupEnd();
  // Fim da apresentação do projeto

  $(function () {
    $('.autoajuste').autoGrowInput({
      minWidth: 60, maxWidth: function () {
        return $('body').width() - 50;
      }, comfortZone: 2
    });

  });

  $(window).resize(function () {
    $('.autoajuste').trigger('autogrow');
  });

  // Definindo máscaras para inputs
  $("#text_cpf").mask("999.999.999-99");
  $("#text_pis").mask("999.99999.99-9");
  $(".data").mask("99/99/9999");
  $(".ano").mask("9999");
  $(".cep").mask("99999-999");
  $(".nrdamp").mask("999999999999999");
  $(".numh").mask("99");
  $(".valor").maskMoney();

  $(document).ready(function () {
    // OS CÓDIGOS ABAIXO:
    // Desabilitam botão de impressão para ser acionado mais tarde por outra função
    $('#btImprimir').prop("disabled", false);
    $("#btImprimir").attr('disabled', 'disabled');

    // Permite ou não impressão por atalho
    document.onkeydown = function (e) {
      exports.verificaAutImpressao(exports.isOK(), e);
    };

    document.onkeyup = function (e) {
      exports.verificaAutImpressao(exports.isOK(), e);
    };

    document.onkeypress = function (e) {
      exports.verificaAutImpressao(exports.isOK(), e);
    };

    // Quando o usuário tentar imprimir a página por um atalho (sem ser os de teclado - já impeditos acima), será exibido um alerta
    const beforePrint = function () {
      exports.verificaAutImpressao(exports.isOK());
    };

    window.onbeforeprint = beforePrint;

    $('[data-toggle="tooltip"]').tooltip();

    // PERMITIR DIGITAR APENAS TEXTO NO CAMPO INDICADO
    // KEY PERMITIDAS: 8 = BACKSPACE; 9 = TAB; 17= CRTL; 32 = SPACE; 46 = DELETE; 36~39 =  TECLAS HOME, LEFT ARROW, UP ARROW, RIGHT ARROW, DOWN ARROW, 66~89 CHARS DE A a Z, 186 = ç
    $(function () {
      $('.somentetexto').keydown(function (e) {
        //if (e.ctrlKey || e.altKey){
        if (e.altKey) {
          e.preventDefault();
        } else {
          let key = e.keyCode;
          if (!((key === 8) || (key === 9) || (key === 186) || (key === 17) || (key === 32) || (key === 46) || (key >= 35 && key <= 40) || (key >= 65 && key <= 90))) {
            e.preventDefault();
          }
        }
      });
    });

    // VALIDAÇÃO DO PIS E CPF
    $('#text_cpf').keyup(function () {
      let cpf = $(this).val();
      //let cpf4 = ($(this).val());
      //let cpf2 =cpf.match(/\d+/);/*retorna somente números numa array*/
      let cpf3 = cpf.replace(/[^0-9]/gi, '');/*somente números*/
      let lngCPF = cpf3.length;

      if (lngCPF === 11) {
        let rr = vercpf(cpf3);
        if (!rr) {
          $('#text_cpf').fadeOut(200).fadeIn(150).fadeOut(200).fadeIn(150);
          modCPFPIS(cpf3, "CPF");

        }
      }
    });

    $('#text_pis').keyup(function () {
      let pis = $(this).val();
      //let pis4 = ($(this).val());
      //let pis2 =pis.match(/\d+/);
      // Retorna somente números num array*/
      let pis3 = pis.replace(/[^0-9]/gi, '');
      let lngPIS = pis3.length;

      if (lngPIS === 11) {
        let rr = verpis(pis3);
        if (!rr) {
          $('#text_pis').fadeOut(200).fadeIn(150).fadeOut(200).fadeIn(150);
          modCPFPIS(pis3, "PIS");

        }
      }
    });


    // EXIBIR MODAL QUANDO HOUVER DIVERGÊNCIA ENTRE ANO BASE E EXERCICIO NO IR
    // OBS.: ISSO NÃO APAGA O CAMPO DIGITADO ERRADO, APENAS INFORMA USUÁRIO QUE  HÁ ERRO.
    $("input.ano").keyup(function () {
      let inptID = $(this).attr("id");
      if (inptID.indexOf("text_irexerc") >= 0) {
        let dataFull = $(this).val().replace(/\D+/g, '');
        let typedYearLen = dataFull.length;

        if (typedYearLen === 4) {
          let anoExercicio = $(this).val();
          let c = inptID.substr(inptID.length - 1);
          anoExercicio = parseInt(anoExercicio);
          let anoBase = $("#text_irano" + c).val();
          anoBase = parseInt(anoBase);

          if (anoExercicio <= anoBase) {
            $("#anoexerc").text(anoExercicio);
            $("#anobase").text(anoBase);
            $('#modal-IR').modal('show');
          }
        }
      }
    });

    // FUNÇÃO PARA ADICIONAR OU REMOVER LINHAS NA TABELA PARA USO DO FGTS
    $("button.btn-fgts").click(function () {
      let btnId = $(this).attr("id");

      switch (btnId) {
        case "btnAdicionar":
          let numContaNova;
          lastRowId = $('#tb1 tr.conta_fgts:last').attr('id');
          let numContaAnt = lastRowId.split('_')[1];
          let numConta = parseInt(numContaAnt) + 1;
          let n = numContaAnt.length;
          let y = numConta.toString();
          y = y.length;

          if (n <= 1 && y !== 2) {
            numContaNova = "0" + numConta;
          } else {
            numContaNova = numConta
          }
          $("#" + lastRowId).after("<tr id=tr_" + numConta + " class='conta_fgts'><td>" + numContaNova + "</td><td><input type='text' data-input='tabela_fgts_" + numContaNova + "_1' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_" + numContaNova + "_2' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_" + numContaNova + "_3' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_" + numContaNova + "_4' class='tabelas_fgts valor valorfgts valorappend' maxlength='17' data-thousands='.' data-decimal='.' data-prefix='R$ '></td></tr>");
          $(".valor").maskMoney();
          break;

        case "btnRemover":
          let lastRowId = $('#tb1 tr.conta_fgts:last').attr('id');
          if (lastRowId === "tr_1") {
            return false
          }
          $("#tb1 > tbody").children("#" + lastRowId).remove();
          $(".valor").maskMoney();
          break;
      }
    });

    // HABILITAR RESIZABLE NOS CAMPOS
    $('.select_resizable').change(function () {
      $(".width_tmp_option").html($('.select_resizable option:selected').text());
      $(this).width($(".width_tmp_select").width() - 14);
    });

    // FUNÇÃO PARA DETERMINAR OS TEXTOS DA MODAL
    $('.modal-popup').click(function () {
      let modalName = $(this).attr('id');

      if ($("#" + modalName).is(":checked")) {
        switch (modalName) {
          // SE SELECIONOU APOSENTADO
          case 'chkocupacao3':
            let txtModal = "Caso possua emprego ativo com rendimento superior ao da aposentadoria/pensão, selecionar a 1ª opção.";
            $('#modal-body-text').text(txtModal);
            $('#minha-modal').modal('show');
            break;

          //case 'chkresidencia1':
          case 'chkresxxx':
            txtModal = "No caso de aquisição pela RESIDÊNCIA, não é permitida a propriedade, posse, promessa de compra, usufruto ou cessão de imóvel residencial urbano, concluído ou em construção, no município de residência atual ou no município da ocupação principal, inclusive nos municípios limítrofes e integrantes da mesma Região Metropolitana.";
            $('#modal-body-text').text(txtModal);
            $('#minha-modal').modal('show');
            break;

          case 'chkresidencia2':// SE NÃO POSSUI IMÓVEL
            txtModal = "Não é permitida a propriedade, posse, promessa de compra, usufruto ou cessão de imóvel residencial urbano ou de parte residencial de imóvel misto, concluído ou em construção, no município da sua ocupação laboral principal nem da sua residência atual, inclusive nos municípios limítrofes e integrantes da mesma Região Metropolitana.";
            $('#modal-body-text').text(txtModal);
            $('#minha-modal').modal('show');
            break;
        }
      }

      if (modalName === "btImprimir") {
        let txtModal = "Após a impressão do documento, colher assinatura do(s) proponente(s) e empregado CAIXA ou Canal Parceiro, bem como colher vistos nas páginas do DAMP (exceto página de assinatura).";
        $('#modal-body-text').text(txtModal);
        $('#minha-modal').modal('show');
      }
    });

    // MONITOR DOS VALORES DIGITADOS NAS CONTAS DO FGTS
    $('td>input.valor').keyup(function () {
      let unmk = $(".valorfgts").maskMoney('unmasked');/*retiro a mascara da classe do saldo do fgts, e coloco valor numa array*/
      let sum1 = 0;
      for (let j = 0; j <= unmk.length - 1; j++) {
        let jArr = unmk[j];
        sum1 += parseFloat(jArr);/*soma os valores digitados*/
      }
      $('#resultado').val('R$ ' + parseFloat(sum1, 10).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1."));/*EXPRESSÃO REGULAR PARA FORMATO MONETARIO BRASILEIRO*/
    });

    $(document).on('keyup', "input[type='text'].valorappend", function () {
      let unmk = $(".valorfgts").maskMoney('unmasked');
      let sum1 = 0;
      for (let j = 0; j <= unmk.length - 1; j++) {
        let jArr = unmk[j];
        sum1 += parseFloat(jArr);/*soma os valores digitados*/
      }
      $('#resultado').val('R$ ' + parseFloat(sum1, 10).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1."));
    });

    function modCPFPIS(nrEvento, evento) {
      let evT = "";
      switch (evento) {
        case "CPF":
          let textoinicial = "O CPF "
          let textofim = "Verifique e faça a correção."

          $('#md-header').text(evento);
          $('#textoinicial').text(textoinicial);
          $('#nrDigitado').text(nrEvento);
          $('#textofim').text(textofim);
          $('#modalCPFPIS').modal('show');
          break;

        case "PIS":
          textoinicial = "O PIS "

          $('#md-header').text(evento);
          $('#textoinicial').text(textoinicial);
          $('#nrDigitado').text(nrEvento);
          $('#textofim').text("");
          $('#modalCPFPIS').modal('show');
          break;
      }
    }

    // Verificando dados de configuração da DAMP
    try {
      const armazenados = JSON.parse(localStorage.getItem('damp-settings'));

      if (armazenados !== null && armazenados.length !== 0) {
        if (armazenados['chk_autocomplete'] !== undefined && typeof armazenados['chk_autocomplete'] === 'boolean') {
          controleAutocomplete(armazenados['chk_autocomplete']);
          $('#chk_autocomplete').prop('checked', armazenados['chk_autocomplete']);
        } else {
          controleAutocomplete(true);
          $('#chk_autocomplete').prop('checked', true);
        }

        if (armazenados['chk_scale_print'] !== undefined && typeof armazenados['chk_scale_print'] === 'boolean') {
          controleEscalaImpressao(armazenados['chk_scale_print']);
          $('#chk_scale_print').prop('checked', armazenados['chk_scale_print']);
        } else {
          controleEscalaImpressao(false);
          $('#chk_scale_print').prop('checked', false);
        }

        if (armazenados['chk_years'] !== undefined && typeof armazenados['chk_years'] === 'boolean') {
          controlePreenchimentoAnosIR(armazenados['chk_years']);
          $('#chk_years').prop('checked', armazenados['chk_years']);
        } else {
          $('#chk_years').prop('checked', true);
        }
      } else {
        // Configurações padrão
        try {
          const option = new Object();
          option['chk_autocomplete'] = true;
          option['chk_scale_print'] = false;
          option['chk_years'] = true;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        } catch (error) {
          console.log('Um erro ocorreu ao inicializar as configurações da DAMP. Erro:', error)
        }

        controleAutocomplete(true);
        $('#chk_autocomplete').prop('checked', true);
        controleEscalaImpressao(false);
        $('#chk_scale_print').prop('checked', false);
        controlePreenchimentoAnosIR(true);
        $('#chk_years').prop('checked', true);
      }

    } catch (error) {
      console.log('Um erro ocorreu ao verificar as configurações da DAMP. Erro:', error)
    }
  });
  // FIM DO DOCUMENT READY

  window.addEventListener('DOMContentLoaded', () => {
    // Definindo data
    const date = new Date().toLocaleDateString('pt-BR');
    if (new RegExp('(?<dia>[0-9]{2})\/(?<mês>[0-9]{2})\/(?<ano>[0-9]{4})').test(date)) {
      let { dia, mes, ano } = date.match(/(?<dia>[0-9]{2})\/(?<mes>[0-9]{2})\/(?<ano>[0-9]{4})/).groups;

      $('#end_camp').val(`${dia}`);
      $('[data-input="mes_assin"]').val(` ${converterParaMesBRL(mes).toUpperCase()} `);
      $('[data-input="ano_assin"]').val(`${ano}`);
    }

    // Definindo local de assinatura padrão e preenchendo cidade e estado de residência padrão e ocupação
    [$('#local_assin'), $('#text_logradouro'), $('#text_localocupa')].forEach(e => e.val('Belo Horizonte'.toUpperCase()));
    [$('#text_uf0'), $('#text_uf1'), $('#text_uf2')].forEach(e => e.val('MG'));

    // Preenche anos de residência no municípios
    $('#text_compl1').val('10');
    $('#text_compl2').val('00');

    // Marca os checkboxes
    ['chkocupacao1', 'chkresidencia1', 'chkuniaoestavel2'].forEach(e => {
      $(`#${e}`).attr('checked', true);
    });

    // Autocomplete
    // Adiciona profissões mais usadas em uma lista de sugestões do input de ocupação e cidades nos inputs de cidades
    const ocupacoes = [
      "ACOUGUEIRO",
      "ACUPUNTURISTA",
      "ADESTRADOR DE ANIMAIS",
      "ADMINISTRADOR",
      "ADVOGADO",
      "AFIADOR",
      "AGENCIADOR DE PROPAGANDA",
      "AGENTE ADMINISTRATIVO",
      "AGENTE DE SERVICOS FUNERARIOS E EMBALSAMADOR",
      "AGENTE DE VIAGEM E GUIA DE TURISMO",
      "AGRICULTOR",
      "AGRONOMO",
      "ALAMBIQUEIRO",
      "ALFAIATE",
      "ANALISTA DE SISTEMA",
      "ANALISTA DE SISTEMAS",
      "APOSENTADO EXCETO FUNCIONARIO PUBLICO",
      "ARQUITETO",
      "ARTISTA DE CIRCO",
      "ARTISTA DE DANÇA",
      "ARTISTA VISUAL",
      "ASSISTENTE SOCIAL",
      "ASTROLOGO E NUMEROLOGO",
      "ASTRONOMO E METEOROLOGISTA",
      "ATLETA",
      "ATLETA PROFISSIONAL E TECNICO EM DESPORTOS",
      "ATIVIDADES RELIGIOSAS",
      "ATOR",
      "ATOR E DIRETOR DE ESPETACULOS PUBLICOS",
      "ATUARIO E MATEMATICO",
      "AUXILIAR DE ESCRITORIO E ASSEMELHADOS",
      "AUXILIAR DE LABORATORIO",
      "AUXILIAR GERAL",
      "BABA",
      "BANCARIO E ECONOMIARIO",
      "BARBEIRO",
      "BIBLIOTECARIO ARQUIVISTA MUSEOLOGO E ARQUEOLOGO",
      "BIOLOGO",
      "BIOLOGO E BIOMEDICO",
      "BIOMEDICO",
      "BOLSISTA ESTAGIARIO E ASSEMELHADOS",
      "BOMBEIRO E INSTALADOR DE GAS AGUA ESGOTO E ASSEMELHADOS",
      "BORDADOR",
      "BORRACHEIRO",
      "CABELEIREIRO(A)",
      "CABELEIREIRO BARBEIRO MANICURE PEDICURE MAQUILADOR ESTETICISTA E MASSAGISTA",
      "CAMAREIRO(A)",
      "CAMINHONEIRO AUTONOMO",
      "CANTOR E COMPOSITOR",
      "CANTOR(A)",
      "CAPITALISTA RECEBENDO RENDIMENTO DE APLICACAO DE CAPITAL EM ATIVOS FINANCEIROS",
      "CARPINTEIRO",
      "CARREGADOR DE MERCADORIAS",
      "CARROCEIRO",
      "CARTOGRAFO",
      "CATADORES DE MATERIAL RECICLAVEL",
      "CERAMISTA",
      "CHAVEIRO",
      "CHEFE INTERMEDIARIO",
      "COBRADOR",
      "COMANDANTE DE EMBARCACOES",
      "COMENTARISTA DE RADIO E TELEVISAO",
      "COMISSARIO DE BORDO",
      "COMPOSITOR",
      "COMUNICOLOGO",
      "CONFEITEIRO(A)",
      "CONSERTADOR DE APARELHO ELETRONICO ELETRODOMESTICO",
      "CONSULTOR",
      "CONTADOR",
      "CONTRAMESTRE DE EMBARCACOES",
      "COREOGRAFO E BAILARINO",
      "CORRETOR",
      "CORRETOR DE IMOVEIS, SEGUROS, TITULOS E VALORES",
      "COSTUREIRO(A)",
      "COZINHEIRO(A)",
      "CROCHETEIRO A MAO",
      "CUIDADOR DE IDOSOS",
      "DECORADOR",
      "DECORADOR(A)",
      "DEDETIZADOR",
      "DELEGADO DE POLICIA",
      "DEMONSTRADOR",
      "DEPOSITOS PCI PAI",
      "DESENHISTA",
      "DESENHISTA COMERCIAL",
      "DESENHISTA INDUSTRIAL",
      "DESENHISTA TECNICO",
      "DESPACHANTE",
      "DESPACHANTE INCLUSIVE O ADUANEIRO",
      "DIGITADOR",
      "DIPLOMATA",
      "DIRETOR DE EMPRESAS",
      "DIRETOR DE ESTABELECIMENTO DE ENSINO",
      "ECONOMISTA",
      "ELETRICISTA",
      "ELETRICISTA E ASSEMELHADOS",
      "ELETRICISTA MANUTENCAO VEICULO AUTO MAQ APARELHOS ELETRICO ELETRONICO E TELECOM",
      "EMPREGADO DOMESTICO",
      "EMPRESARIO E PRODUTOR DE ESPETACULOS PUBLICOS",
      "ENCANADOR",
      "ENFERMEIRO E NUTRICIONISTA",
      "ENFERMEIRO(A)",
      "ENGENHEIRO",
      "ENGRAXATE",
      "ESCULTOR, PINTOR E ASSEMELHADOS",
      "ESOTERICO E PARANORMAL",
      "ESPOLIO",
      "ESTATISTICO",
      "ESTETICISTA",
      "ESTIVADOR CARREGADOR EMBALADOR E ASSEMELHADOS",
      "ESTOFADOR",
      "EXTRATIVISTA",
      "FARMACEUTICO",
      "FAXINEIRO(A)",
      "FEIRANTE",
      "FISCAL",
      "FISICO",
      "FISIOTERAPEUTA",
      "FISIOTERAPEUTA E TERAPEUTA OCUPACIONAL",
      "FONAUDIOLOGO",
      "FOTOGRAFO(A)",
      "FUNCIONARIO PUBLICO CIVIL APOSENTADO",
      "FUNILEIRO",
      "GANDULA",
      "GARCOM GARCONETE",
      "GARIMPEIRO",
      "GEOGRAFO",
      "GEOLOGO",
      "GERENTE",
      "GESSEIRO",
      "GOVERNANTA DE HOTEL CAMAREIRO PORTEIRO COZINHEIRO E GARCOM",
      "GUARDADOR DE VEÍCULOS (FLANELINHA)",
      "GUIA DE TURISMO",
      "INTERPRETE",
      "JARDINEIRO",
      "JOALHEIRO E OURIVES",
      "JOALHEIROS E OURIVES",
      "JORNALEIRO",
      "JORNALISTA",
      "LADRILHEIRO",
      "LANTERNEIRO E PINTOR DE VEICULOS METALICOS",
      "LAVADOR DE VEÍCULOS",
      "LAVADOR E PASSADOR DE ROUPAS",
      "LEILOEIRO, AVALIADOR E ASSEMELHADOS",
      "LIMPADOR DE FACHADAS",
      "LOCUTOR E COMENTARISTA DE RADIO E TELEVISAO E RADIALISTA",
      "MANICURE, PEDICURE",
      "MANOBRISTA",
      "MAQUIADOR",
      "MAQUINISTA E FOGUISTA DE EMBARCACOES, LOCOMOTIVAS E ASSEMELH",
      "MARCENEIRO",
      "MARINHEIRO E ASSEMELHADOS",
      "MASSAGISTA",
      "MECANICO DE MANUTENCAO DE VEICULOS AUTOMOTORES E MAQUINAS",
      "MECANICO MANUTENCAO MONTADOR PREPARADOR OPERADOR DE MAQ E APARELHOS PROD INDUST",
      "MECÂNICO",
      "MEDICO",
      "MESTRE E CONTRAMESTRE",
      "MILITAR EM GERAL",
      "MILITAR REFORMADO",
      "MINHOCULTOR",
      "MODELO DE MODAS",
      "MODELO.",
      "MONTADOR DE MÓVEIS",
      "MOTOBOY",
      "MOTORISTA",
      "MOTORISTA DE VEICULOS DE TRANSPORTE DE CARGA",
      "MOTORISTA DE VEICULOS DE TRANSPORTE DE PASSAGEIROS",
      "MUSICO",
      "MÉDICO",
      "NUTRICIONISTA",
      "OCUPANTE DE CARGO DE DIRECAO E ASSESSORAMENTO INTERMEDIARIO",
      "OCUPANTE DE CARGO DE DIRECAO E ASSESSORAMENTO SUPERIOR",
      "ODONTOLOGO",
      "OFICIAIS DAS FORCAS ARMADAS E FORCAS AUXILIARES",
      "OLEIRO (FAB TELHAS E TIJOLOS)",
      "OPERADOR DE CAMERAS DE CINEMA E TELEVISAO",
      "OPERADOR DE CÂMERA",
      "OUTROS TRABALHADORES DE NIVEL SUPERIOR LIGADOS AO ENSINO",
      "PADEIRO",
      "PECUARISTA",
      "PEDREIRO",
      "PENSIONISTA",
      "PENSÃO INFORMAL",
      "PESCADOR.",
      "PESQUISADOR",
      "PILOTO DE AERONAVE",
      "PILOTO DE AERONAVES",
      "PINTOR",
      "PIPOQUEIRO",
      "PODER EXECUTIVO PRESIDENTE MINISTRO GOVERNADOR SECRETARIO E MEMBROS DO MP",
      "PODER JUDICIARIO MINISTRO DE TRIBUNAL SUPERIOR DESEMBARGADOR E JUIZ",
      "PODER LEGISLATIVO SENADOR DEPUTADO FEDERAL DEPUTADO ESTADUAL E VEREADOR",
      "PODÓLOGO",
      "POETA",
      "PORTEIRO DE EDIFICIO ASCENSORISTA GARAGISTA E FAXINEIRO",
      "PORTEIRO, VIGIA",
      "PROCURADOR E ASSEMELHADOS",
      "PROFESSOR",
      "PROFESSORES DE ENSINO DE PRIMEIRO E SEGUNDO GRAUS",
      "PROFESSORES DE ENSINO SUPERIOR",
      "PROFISSAO CRIADA PARA TESTE",
      "PROFISSIONAIS DE LETRAS E DE ARTES",
      "PROFISSIONAL DO SEXO",
      "PROGRAMADOR",
      "PROMOTOR DE EVENTOS",
      "PROPRIETARIO DE ESTABELECIMENTO AGRICOLA DA PECUARIA FLORESTAL",
      "PROPRIETARIO DE ESTABELECIMENTO COMERCIAL",
      "PROPRIETARIO DE ESTABELECIMENTO DE PRESTACAO DE SERVICOS",
      "PROPRIETARIO DE ESTABELECIMENTO INDUSTRIAL",
      "PROPRIETARIO DE IMOVEL, RECEBENDO RENDIMENTO DE ALUGUEL",
      "PROPRIETARIO DE MICROEMPRESA",
      "PROTETICO",
      "PROTÉTICO",
      "PSICOLOGO",
      "PSICÓLOGO",
      "PUBLICITARIO",
      "PUBLICITÁRIO",
      "QUIMICO",
      "QUIROPRAXISTA",
      "RAIZEIRO",
      "RELACOES PUBLICAS",
      "RELOJOEIRO",
      "REPRESETANTE COMERCIAL",
      "SACERDOTES OU MEMBROS DE ORDENS OU SEITAS RELIGIOSAS",
      "SACOLEIRA",
      "SALVA-VIDAS",
      "SAPATEIRO",
      "SECRETARIO ESTENOGRAFO DATILOGRAFO RECEPCIONISTA TELEFONISTA E ASSEMELHADOS",
      "SECURITARIO",
      "SERRALHEIRO",
      "SERVENTE DE OBRAS",
      "SERVENTUARIO DE JUSTICA",
      "SERVIDOR PUBLICO ESTADUAL",
      "SERVIDOR PUBLICO FEDERAL",
      "SERVIDOR PUBLICO MUNICIPAL",
      "SERVIÇOS GERAIS",
      "SOCIO DE EMPRESA",
      "SOCIOLOGO",
      "SOLDADOR",
      "SUPERVISOR, INSPETOR E AGENTE DE COMPRAS E VENDAS",
      "TABELIAO",
      "TAXISTA",
      "TECNICO DE BIOLOGIA",
      "TECNICO DE CONTABILIDADE E DE ESTATISTICA",
      "TECNICO DE ELETRICIDADE, ELETRONICA E TELECOMUNICACOES",
      "TECNICO DE LABORATORIO E RAIO X",
      "TECNICO DE MECANICA",
      "TECNICO DE QUIMICA",
      "TECNICO EM AGRONOMIA E AGRIMENSURA",
      "TECNOLOGO",
      "TELHADOR",
      "TOPÓGRAFO",
      "TRABALHADOR AGRICOLA",
      "TRABALHADOR DA PECUARIA",
      "TRABALHADOR DA PESCA",
      "TRABALHADOR DE ARTES GRAFICAS",
      "TRABALHADOR DE CONSTRUCAO CIVIL",
      "TRABALHADOR DE FABRICACAO DE ARTEFATOS DE MADEIRA",
      "TRABALHADOR DE FABRICACAO DE CALCADOS E ARTEFATOS DE COURO",
      "TRABALHADOR DE FABRICACAO DE PAPEL E PAPELAO",
      "TRABALHADOR DE FABRICACAO DE PRODUTOS DE BORRACHA E PLASTICO",
      "TRABALHADOR DE FABRICACAO DE PRODUTOS TEXTEIS EXCETO ROUPAS",
      "TRABALHADOR DE FABRICACAO DE ROUPAS",
      "TRABALHADOR DE FABRICACAO E PREPARACAO DE ALIMENTOS E BEBIDA",
      "TRABALHADOR DE INSTALACOES DE PROCESSAMENTO QUIMICO",
      "TRABALHADOR DE TRATAMENTO DE FUMO E DE FABRICACAO DE CIGARROS E CHARUTOS",
      "TRABALHADOR DE USINAGEM DE METAIS",
      "TRABALHADOR DOMÉSTICO",
      "TRABALHADOR DOS SERVICOS DE CONTABILIDADE DE CAIXA E TRABALHADORES ASSEMELHADOS",
      "TRABALHADOR FLORESTAL",
      "TRABALHADOR METALURGICO E SIDERURGICO",
      "TRABALHADOR RURAL",
      "TRABALHADORES DOS SERVICOS DE PROTECAO E SEGURANCA EXCETO MILITAR",
      "TRADUTOR",
      "TRATORISTA",
      "VASSOUREIRO",
      "VENDEDOR (DOMICÍLIO, AMBULANTES, BANCAS)",
      "VENDEDOR DE COMERCIO VAREJISTA E ATACADISTA",
      "VENDEDOR PRACISTA REPRESENTANTE COMERCIAL CAIXEIRO VIAJANTE E ASSEMELHADOS",
      "VETERINARIO E ZOOTECNISTA",
      "VETERINÁRIO",
      "VIDRACEIRO",
      "VIGILANTE E GUARDA DE SEGURANÇA",
      "ZELADOR",
      "ZOOTECNISTA",
    ];

    const listasDeSugestoes = {
      sLOcupacao: [...ocupacoes],
      sLCidades: ["Belo Horizonte", "Contagem", "Betim"],
      sLEstados: ["MG"]
    };

    // O mapeamento de qual input vai o quê
    const adicionarEm = [
      ...["#text_logradouro2", "#text_possuiimovellocal", "#text_logradouro", "#text_localocupa"].map(id => {
        return { inputId: id, listId: "sLCidades" };
      }),
      ...["#text_uf0", "#text_uf1", "#text_uf2", "#text_uf999"].map(id => {
        return { inputId: id, listId: "sLEstados" };
      }),
      { inputId: "#text_ocupacao", listId: "sLOcupacao" }
    ];

    // Cria um único elemento <ul> que será reutilizado para todas as listas de autocomplete.
    const $autocompleteList = $('<ul id="autocomplete-list" class="autocomplete-items"></ul>');
    $('body').append($autocompleteList);
    $autocompleteList.hide(); // Começa escondido

    let activeInput = null; // Para rastrear qual input está ativo

    // Eventos
    adicionarEm.forEach(mapeamento => {
      const $input = $(mapeamento.inputId);
      const sugestoes = listasDeSugestoes[mapeamento.listId].sort((a, b) => a.localeCompare(b));

      // Garante que o input tenha um container relativo para posicionar a lista
      if ($input.parent().css('position') !== 'relative' && $input.parent().css('position') !== 'absolute') {
        $input.parent().addClass('autocomplete-container');
      }

      // Evento quando o usuário digita no campo
      $input.bind('input click', function () {
        const valorDigitado = $(this).val();
        activeInput = this; // Define o input atual como ativo

        // Limpa a lista anterior
        $autocompleteList.empty();

        if (!valorDigitado) {
          $autocompleteList.hide();
          return;
        }

        const valorMinusculo = valorDigitado.toLowerCase();

        const sugestoesFiltradas = sugestoes.filter(item =>
          item.toLowerCase().includes(valorMinusculo)
        );

        if (sugestoesFiltradas.length === 0) {
          $autocompleteList.hide();
          return;
        }

        // Preenche a lista com as sugestões filtradas
        sugestoesFiltradas.forEach(item => {
          // Deixa em negrito a parte que corresponde à digitação
          const regex = new RegExp(`(${valorDigitado})`, 'gi');
          const itemHtml = item.replace(regex, '<strong>$1</strong>');

          const $li = $(`<li>${itemHtml}</li>`);

          // Evento de clique em uma sugestão
          $li.on('click', function () {
            $input.val(item); // Preenche o input com o valor clicado
            $autocompleteList.hide(); // Esconde a lista
            ajustarLarguraInputAoConteudo($input);
          });

          $autocompleteList.append($li);
        });

        // Posiciona e exibe a lista
        const inputPos = $(this).offset();
        const inputHeight = $(this).outerHeight();
        // const inputWidth = $(this).outerWidth();

        $autocompleteList.css({
          top: inputPos.top + inputHeight + 2, // 2px de espaço
          left: inputPos.left,
          width: "auto"
        });
        $autocompleteList.show();
      });

      // Esconde a lista quando o input perde o foco
      $input.on('blur', function () {
        // Usamos um pequeno timeout para permitir que o evento de 'click' na <li>
        // seja processado antes da lista desaparecer.
        setTimeout(() => {
          // Só esconde se o mouse não estiver sobre a lista
          if (!$autocompleteList.is(':hover')) {
            $autocompleteList.hide();
          }
        }, 200);
      });
    });

    // Um truque final para garantir que a lista feche se você clicar fora dela
    $(document).on('click', function (e) {
      if (!$(e.target).closest('.autocomplete-container').length) {
        $autocompleteList.hide();
      }
    });

    // Impede o fechamento da página se tiver algo preenchido
    window.addEventListener("beforeunload", function (e) {
      const inputs = document.querySelectorAll("input, textarea, select");
      let hasData = false;

      inputs.forEach(input => {
        if (input.type !== "hidden" && input.value.trim() !== "") {
          hasData = true;
        }
      });

      if (hasData) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    // Verificando se existem parâmetros que foram definidos
    try {
      const URLParams = new URLSearchParams(new URL(window.location).search);
      const dadosURL = new Object();
      let dado;

      for (dado of Array.from(URLParams)) {
        dadosURL[dado[0]] = dado[1];
      }

      recuperarDados(dadosURL);
    } catch (error) {
      console.log("Um erro ocorreu ao tentar recuperar os dados passado por parâmetro. Erro: %s", error);
    }
  })

  // Monitoramento de eventos

  /*SELECT MONITOR*/
  $(document).on('change', '#selectEstCiv', function () {
    verificaEstadoCivil($(this).val(), this);
  });

  $('#end_comp_logradouro').click(function () {
    $('#end_comp_bairro').slideToggle(600);
    $('#mostrarCampoEnd').slideToggle(600);
  });

  // Monitoramento de preench. do campo de logradouro, N.º, CEP
  let timeout;
  $('[data-input="endereco_logradouro"]').on('keydown', () => {
    // Verifica se o campo está preenchido
    if ($('[data-input="endereco_logradouro"]').text().trim().length === 0) {
      // Se estiver, desativa o timeout e aciona a função de impedir impressão
      clearTimeout(timeout);
      exports.noPrintSettings();
      exports.isOK(false);
    } else {
      // Se preenchido, desativa o timeout e atribui a variável um novo timeout que aciona a validação de impressão
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const ret = exports.HabilitaImpressao();
        if ([true, false].includes(ret)) exports.isOK(ret);
      }, 3500);
    }
  })

  // CHECKBOX MONITOR
  $('input[type="checkbox"]').click(function () {
    let chkID = $(this).attr('id');
    let chkClass = $(this).attr('class');
    let gparent = $(this).parent().parent().attr('id');
    let chldCount = $('#' + gparent).find('input[type=checkbox]').length;
    let chldCountEnq = $('#' + gparent).find('input[type=checkbox].enquad').length;
    let classYESNO = chkClass ? (chkClass.indexOf("yesno") >= 0) : ""

    if (!['chk_autocomplete', 'chk_scale_print', 'chk_years'].includes(this.getAttribute('id'))) {
      if (chkClass !== "yesno" && classYESNO === false) {
        if (gparent === "enquadramento") {
          chldCount = chldCountEnq;
        }

        if ($("#" + chkID).is(":checked")) {
          for (let i = 1; i <= chldCount; i++) {
            let hddDiv = "#" + gparent + i;
            let hddchk = "#chk" + gparent + i;
            if (!$(hddchk).is(":checked")) {
              $(hddchk).prop('checked', false);
              $(hddDiv).hide(400);
            }
            if (gparent === "enquadramento" && ($(hddchk).is(":checked"))) {
              $("#boxenq" + i).show(400);
            }
          }
        } else {
          for (let i = 1; i <= chldCount; i++) {
            let hddDiv = "#" + gparent + i;
            let hddchk = "#chk" + gparent + i;
            $(hddchk).prop('checked', false);
            $(hddDiv).show(400);
            if (gparent === "enquadramento" && (!$(hddchk).is(":checked"))) {
              $("#boxenq" + i).hide(400);
            }
          }
        }
      }

      if (classYESNO === true) {
        let numIndexA = parseInt(chkID.split("_")[1]);
        let chkname = chkID.split("_")[0];
        let num = numIndexA;
        let numIndexB = num;
        if ((numIndexA % 2) === 0) {
          numIndexB--;
        } else {
          numIndexB++;
        }

        if ($("#" + chkID).is(":checked")) {
          let thisCheck = '#' + chkID;
          let thisSpan = '#span_' + numIndexA;
          let nextCheck = '#' + chkname + '_' + numIndexB;
          let nextSpan = '#span_' + numIndexB;

          $(thisSpan).css({ "fontWeight": "bold", "color": "black" });
          $(thisCheck).prop('checked', true);

          $(nextSpan).css({ "fontWeight": "normal", "color": "#FEFEFF" });
          $(nextCheck).prop('checked', false);

          $(nextSpan).hide(400);

          // SN 11 é o checkbox de USO de FGTS Futuro SIM
          // SN 12 é o checkbox de USO de FGTS Futuro NÃO

          // SN 9 é o checkbox de USO de FGTS SIM
          // SN 10 é o checkbox de USO de FGTS NÃO

          // Ação para seleção de USO de FGTS Futuro
          if (gparent === "usofgtsfuturo" && ($('#sn_11').is(":checked"))) {
            $("#span_12").hide(300);
            $("#cond_ftgs_msg").show(400);
            $("#declaracao-tit-FGTS").show(400);
          }
          if (gparent === "usofgtsfuturo" && ($('#sn_12').is(":checked"))) {
            $("#span_11").hide(300);

            if (!$('#sn_11').is(':checked') && !$('#sn_9').is(":checked")) {
              $("#cond_ftgs_msg").hide(400);
              $("#declaracao-tit-FGTS").hide(400);
            }
          }

          // Ação para seleção de USO de FGTS
          if (gparent === "usofgts" && ($('#sn_9').is(":checked"))) {
            $("#tab_contasfgts").show(400);
            $("#cond_ftgs_msg").show(400);
            $("#declaracao-tit-FGTS").show(400);
          }
          if (gparent === "usofgts" && ($('#sn_10').is(":checked"))) {
            $("#tab_contasfgts").hide(400);

            if (!$('#sn_11').is(':checked') && !$('#sn_9').is(":checked")) {
              $("#cond_ftgs_msg").hide(400);
              $("#declaracao-tit-FGTS").hide(400);
            }
          }
        } else {
          $('#span_' + numIndexA).css({ "fontWeight": "normal", "color": "black" });
          $('#span_' + numIndexA).prop('checked', false);
          $('#span_' + numIndexA).show(150);
          $('#span_' + numIndexB).css({ "fontWeight": "normal", "color": "black" });
          $('#span_' + numIndexB).prop('checked', false);
          $('#span_' + numIndexB).show(150);

          // Caso os checkbox de USO de FGTS e de FGTS Futuro não esteja marcado, oculta a tabela de contas do FGTS, declaração e título para FGTS
          const checkboxes = [
            $('#sn_11').is(":checked"),
            $('#sn_12').is(":checked"),
            $('#sn_10').is(":checked"),
            $('#sn_9').is(":checked")
          ]

          if (checkboxes.every((c) => c === false)) {
            $("#cond_ftgs_msg").hide(400);
            $("#declaracao-tit-FGTS").hide(400);
          } else if (!checkboxes[0] && !checkboxes[3]) {
            $("#cond_ftgs_msg").hide(400);
            $("#declaracao-tit-FGTS").hide(400);
          } else if (checkboxes[0] || checkboxes[3]) {
            $("#cond_ftgs_msg").show(400);
            $("#declaracao-tit-FGTS").show(400);
          }
        }
      }

      // REMOVE O QUE FOI PREENCHIDO DENTRO DO CONTAINER AO QUAL SE ENCERRA CASO CHKBOX SEJA DESMARCADO
      if (!$("#" + chkID).is(":checked")) {
        $(this).parent().find('input:text').val('');
      }

      // CONDIÇÕES ESPECIAIS PARA OS CHECKS, SE ELAS HOUVEREM
      switch (chkID) {
        // SE FOR USUFRUTUÁRIO, ABRE O COMPLEMENTO PARA INFORMAR O MUNICIPIO DO IMOVEL
        case "chkusufruto2":
          $('#municipio_usufruto').toggle(400);
          if (!$("#" + chkID).is(":checked")) {
            $('#mun_usufruto').val('');
            $('#uf_usufruto').val('');
          }
          break;
        case "":
          break;
      }
    } else {
      const armazenados = JSON.parse(localStorage.getItem('damp-settings'));

      try {
        if (armazenados === null || armazenados.length === 0) {
          const option = {};
          option[this.getAttribute('id').trim().toLowerCase()] = this.checked;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        } else {
          const option = armazenados;
          option[this.getAttribute('id').trim().toLowerCase()] = this.checked;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        }

        switch (this.getAttribute('id').trim().toLowerCase()) {
          case 'chk_autocomplete':
            controleAutocomplete(this.checked);
            break;

          case 'chk_scale_print':
            controleEscalaImpressao(this.checked);
            break;

          case 'chk_years':
            controlePreenchimentoAnosIR(this.checked);
            break;
        }
      } catch (error) {
        console.log('Um erro ocorreu ao setar as configurações da DAMP. Erro:', error)
      }
    }
  });

  // Carrega e exibe modal com os registros que foram armazenados
  $('[data-action="registros-salvos"]').click(evento => {
    carregarRegistros();
    $('#modal-registros-salvos').modal('show');
  });

  // Para trocar de página quando houver click no botão de trocar página da paginação
  $('[data-index-pagination]').on('click', (event) => {
    event.preventDefault();
    const idIndexPaginationButton = event.dataset.indexPagination;
    if (![null, undefined].includes(idIndexPaginationButton)) {
      // Alterando class active
      Array.from($(".pagination-page")).forEach((page, index) => index !== idIndexPaginationButton ? page.classList.remove("active") : page.classList.add("active"));
    } else {
      console.log("Não foi possível localizar o ID do botão de troca de paginação.");
    }
    // Removendo a classe de ativo para as páginas exceto a do mesmo index do botão
  });

  // Para exportar os registros armazenados
  $('[data-action="exportar-registros"]').on('click', (event) => {
    event.preventDefault();
    exportarRegistrosArmazenados();
  });

  // Habilita a impressão
  $('input').change(function () {
    let chkID = $(this).attr('id');

    if (!['chk_autocomplete', 'chk_scale_print', 'chk_years'].includes(this.getAttribute('id'))) {
      const ret = HabilitaImpressao(chkID);
      if ([true, false].includes(ret)) exports.isOK(ret);
    }
  });

  // Aciona funções para impressão
  function printWindow() {
    ocultarElementosEnquantoImprime();
    window.print();
    salvarRegistro();
    exibirElementoDepoisImpressao();
  }

  // Monitora o campo de endereço para preenchimento automático
  const enderecoLog = document.querySelector('[data-input="endereco_logradouro"]');
  enderecoLog.addEventListener('blur', () => {
    const value = enderecoLog.textContent;
    if (!value) return;

    // Tenta recuperar o endereço e preencher os campos de cidade e UF
    try {
      const endereco = value.match(/(?<logradouro>.+), n.?º (?<numero>\d+)(, )?(?<complemento>.+)(, )?CEP (?<cep>\d{5}-?\d{3}|\d{2}.\d{3}-?\d{3})(, )?(?<cidade>.+)\/(?<uf>.+)/i).groups;

      const [input_cidade, input_UF] = [
        document.querySelector('[data-input="text_logradouro2"]'),
        document.querySelector('[data-input="text_uf2"]')
      ];

      if (endereco.cidade) $(input_cidade).val(endereco.cidade);
      if (endereco.uf) $(input_UF).val(endereco.uf);

      // Resize do input de endereço para caber o texto
      if ((input_cidade.value.length * 10) > 0) input_cidade.style.width = `${input_cidade.value.length * 10}px`;
    } catch (error) {
      //
    } finally {
      enderecoLog.textContent = value;
    }
  });

  // Monitora o submit do form
  document.querySelector("form#damp_form").addEventListener("submit", (e) => {
    e.preventDefault();
  })

  // Monitora o click no botão com prop [data-action="limpar-form"]
  document.querySelector("[data-action='limpar-form']").addEventListener("click", () => {
    if (confirm("Você tem certeza que deseja limpar o formulário? Não será possível recuperar o progresso depois.")) limparFormDamp();
  });

  // Definindo as funções globais, para acesso via eventos no HTML
  window.printWindow = printWindow;
  window.recuperarRegistroSalvo = recuperarRegistroSalvo;
  window.apagarRegistroSalvo = apagarRegistroSalvo;

  // Verifica se ESC foi pressionado para fechar os modais, se estiverem ativos
  document.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
      [...$('.modal')].forEach(modal => {
        modal.classList.contains('in') ? modal.querySelector('[data-dismiss="modal"]').click() : '';
      })
    }
  });
})();