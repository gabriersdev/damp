"use strict";

// Importando todas as funções exportadas no arquivo functions.js e add. globalmente
import * as exports from "./publicFunctions.js"

Object.entries(exports).forEach(([name, exported]) => window[name] = exported);

// Importando
import {
  salvarRegistro,
  apagarRegistroSalvo,
  carregarRegistros,
  recuperarRegistroSalvo,
  recuperarDados,
  exportarRegistrosArmazenados
} from "./dataBaseFunctions.js";
import {controlePreenchimentoAnosIR, vercpf} from "./publicFunctions.js";

(() => {
  // TODO - Corrigir: auteração do OK não funciona para recuparação de registro salvo!
  
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
      let {dia, mes, ano} = date.match(/(?<dia>[0-9]{2})\/(?<mes>[0-9]{2})\/(?<ano>[0-9]{4})/).groups;
      
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
    
    const criarDatalist = (itens, listaId) => {
      const datalist = document.createElement("datalist");
      datalist.id = listaId;
      
      itens.toSorted((a, b) => a > b).forEach(ocp => {
        const opt = document.createElement("option")
        opt.value = ocp;
        datalist.appendChild(opt);
      });
      
      document.body.appendChild(datalist);
    }
    
    // Adiciona profissões mais usadas em uma lista de sugestões do input de ocupação e cidades nos inputs de cidades
    const ocupacoes = [
      "Proprietário de empresa",
      "Proprietária de empresa",
      "Analista de sistemas",
      "Servidor público municipal",
      "Servidor público estadual",
      "Servidor público federal",
    ];
    
    const cidadesMaisUsadas = [
      "Belo Horizonte",
      "Contagem",
      "Betim"
    ];
    
    const estadosMaisUsados = ["MG"];
    
    criarDatalist(ocupacoes, "sLOcupacao");
    criarDatalist(cidadesMaisUsadas, "sLCidades");
    criarDatalist(estadosMaisUsados, "sLEstados");
    
    const adicionarEm = [
      ...["#text_logradouro2", "#text_possuiimovellocal", "#text_logradouro", "#text_localocupa"].map(id => {
        return {inputId: id, listId: "sLCidades"};
      }),
      ...["#text_uf0", "#text_uf1", "#text_uf2", "#text_uf999"].map(id => {
        return {inputId: id, listId: "sLEstados"};
      }),
      {inputId: "#text_ocupacao", listId: "sLOcupacao"}
    ]
    
    // Adiciona o id das listas criadas como referência pro input
    adicionarEm.forEach(e => {
      const elm = $(e.inputId);
      $(elm).attr("list", e.listId);
      
      if (!navigator.userAgent.includes("Chrome")) return
      const inpt = document.querySelector(e.inputId)
      
      // Altera o tamanho dos inputs de acordo com a quatidade de caracteres eles tem
      const setWidth = (e, add) => {
        const originalWidth = parseFloat(e.style.width || 0);
        const baseFontSize = parseFloat(e.style.fontSize || 16);
        let novoWidth;
        
        if (add) novoWidth = parseInt(e.value.trim().length || "0") * (baseFontSize / 2) + parseFloat(add || "0");
        else if (originalWidth) novoWidth = originalWidth + 2 * baseFontSize;
        else return;
        
        setTimeout(() => {e.style.width = novoWidth + "px"}, 0);
      }
      
      if (!inpt.value) inpt.setAttribute("size", inpt.placeholder.length || 0)
      else if (inpt.value) inpt.setAttribute("size", inpt.value.trim().length || 0)
      
      if (inpt.value.trim().length !== 0) setWidth(inpt, "32")
      
      setWidth(inpt);
      
      inpt.addEventListener("change", e => {
        const size = e.target.value.trim().length
        e.target.setAttribute("size", size.toString());
        setWidth(e.target);
      })
    })
    
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
          
          $(thisSpan).css({"fontWeight": "bold", "color": "black"});
          $(thisCheck).prop('checked', true);
          
          $(nextSpan).css({"fontWeight": "normal", "color": "#FEFEFF"});
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
          $('#span_' + numIndexA).css({"fontWeight": "normal", "color": "black"});
          $('#span_' + numIndexA).prop('checked', false);
          $('#span_' + numIndexA).show(150);
          $('#span_' + numIndexB).css({"fontWeight": "normal", "color": "black"});
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