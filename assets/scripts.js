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
  novas_funcionalidades.toSorted((a, b) => a.localeCompare(b)).forEach((feature) => {console.info(`${feature}`)});
  console.groupEnd();
  // Fim da apresentação do projeto

  $(function(){
    $('.autoajuste').autoGrowInput({minWidth: 60, maxWidth:	function(){ return $('body').width()-50; }, comfortZone: 2 });
  });

  $(window).resize(function(){ $('.autoajuste').trigger('autogrow'); });
  
  // Definindo máscaras para inputs
  $("#text_cpf").mask("999.999.999-99");
  $("#text_pis").mask("999.99999.99-9");
  $(".data").mask("99/99/9999");
  $(".ano").mask("9999");
  $(".cep").mask("99999-999");
  $(".nrdamp").mask("999999999999999");
  $(".numh").mask("99");
  $(".valor").maskMoney();
  
  $(document).ready(function(){
    //******************** OS CÓDIGOS ABAIXO:
    //DESABILITA O BOTÃO DE IMPRESSÃO, PARA SER HABILITADO NOVAMENTE MAIS TARDE, DEPOIS DE OUTRA FUNÇÃO
    $('#btImprimir').prop("disabled",false);
    $("#btImprimir").attr('disabled','disabled');
    // DESABIILITA O ATALHO CRTL+P, PARA EVITAR IMPRESAO POR ATALHO
    document.onkeydown = function(e){//--> keydown
      if (e.ctrlKey && (e.keyCode === 80)){
        return false;
      }
    };
    document.onkeyup = function(e){//--> keyup
      if (e.ctrlKey && (e.keyCode === 80)){
        return false;
      }
    };
    document.onkeypress = function(e){//keypress
      if (e.ctrlKey && (e.keyCode === 80)){
        return false;
      }
    };
    //REMOVE AS OPÇÕES DO BOTÃO DIREITO DO MOUSE (PARA EVITAR IMPRESSÃO)	
    $(document).on("contextmenu",function(e){
      // return false;
    });
    //**************************************************************
    
    //********************  ACIONA BOOTSTRAP TOOLTIPS
    $('[data-toggle="tooltip"]').tooltip();
    //**************************************************************
    
    //********************  PERMITIR DIGITAR APENAS TEXTO NO CAMPO INDICADO
    //KEY PERMITIDAS: 8 = BACKSPACE; 9 = TAB; 17= CRTL; 32 = SPACE; 46 = DELETE; 36~39 =  TECLAS HOME, LEFT ARROW, UP ARROW, RIGHT ARROW, DOWN ARROW, 66~89 CHARS DE A a Z, 186 = ç
    $(function(){
      $('.somentetexto').keydown(function(e){
        //if (e.ctrlKey || e.altKey){
        if (e.altKey){
          e.preventDefault();
        }else{
          var key = e.keyCode;
          if (!((key == 8) || (key == 9) || (key == 186) || (key == 17) || (key == 32) || (key == 46) || (key >= 35 && key <= 40) || (key >= 65 && key <= 90))){
            e.preventDefault();
          }
        }
      });
    });
    //**************************************************************				
    
    //********************  VALIDAÇÃO DO PIS E CPF
    $('#text_cpf').keyup(function(){
      var cpf = $(this).val();
      //var cpf4 = ($(this).val());
      //var cpf2 =cpf.match(/\d+/);/*retorna somente números numa array*/
      var cpf3 =cpf.replace(/[^0-9]/gi, '');/*somente números*/
      var lngCPF = cpf3.length;
      
      if (lngCPF == 11){
        var rr = vercpf (cpf3);					
        if (!rr){
          $('#text_cpf').fadeOut(200).fadeIn(150).fadeOut(200).fadeIn(150);
          modCPFPIS(cpf3, "CPF");
          
        }
      }
    });		
    
    $('#text_pis').keyup(function(){
      var pis = $(this).val();
      //var pis4 = ($(this).val());
      //var pis2 =pis.match(/\d+/);/*retorna somente números numa array*/
      var pis3 =pis.replace(/[^0-9]/gi, '');/*somente números*/
      var lngPIS = pis3.length;
      
      if (lngPIS == 11){
        var rr = verpis(pis3);					
        if (!rr){
          $('#text_pis').fadeOut(200).fadeIn(150).fadeOut(200).fadeIn(150);
          modCPFPIS(pis3, "PIS");
          
        }
      }
    });
    //**************************************************************			
    
    
    //********************  EXIBIR MODAL QUANDO HOUVER DIVERGÊNCIA ENTRE ANO BASE E EXERCICIO NO IR
    //OBS.: ISSO NÃO APAGA O CAMPO DIGITADO ERRADO, APENAS INFORMA USUÁRIO QUE  HÁ ERRO.
    $("input.ano").keyup(function(){
      var inptID = $(this).attr("id");
      if (inptID.indexOf("text_irexerc") >= 0 ){
        var dataFull = $(this).val().replace(/\D+/g, '');
        var typedYearLen = dataFull.length;						
        
        if (typedYearLen == 4){
          var anoExercicio = $(this).val();
          var c = inptID.substr(inptID.length - 1);
          anoExercicio = parseInt(anoExercicio);
          var anoBase = $("#text_irano"+c).val();
          anoBase = parseInt(anoBase);
          
          if (anoExercicio <= anoBase){
            $("#anoexerc").text(anoExercicio);
            $("#anobase").text(anoBase);
            $('#modal-IR').modal('show');
          }
        }
      }
    });
    //**************************************************************
    
    //********************  FUNÇÃO PARA ADICIONAR OU REMOVER LINHAS NA TABELA PARA USO DO FGTS
    $("button.btn-fgts").click(function(){
      var btnId = $(this).attr("id");
      
      switch(btnId){
        case "btnAdicionar":
        let numContaNova;
        var lastRowId = $('#tb1 tr.conta_fgts:last').attr('id');
        var numContaAnt = lastRowId.split('_')[1];
        var numConta = parseInt(numContaAnt) + 1;
        var n = numContaAnt.length;
        var	y = numConta.toString();
        y = y.length;
        
        if (n <= 1 && y != 2 ) {numContaNova = "0"+numConta;}else{numContaNova = numConta}
        $("#"+lastRowId).after("<tr id=tr_"+numConta+" class='conta_fgts'><td>"+numContaNova+"</td><td><input type='text' data-input='tabela_fgts_"+numContaNova+"_1' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_"+numContaNova+"_2' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_"+numContaNova+"_3' class='tabelas_fgts'></td><td><input type='text' data-input='tabela_fgts_"+numContaNova+"_4' class='tabelas_fgts valor valorfgts valorappend' maxlength='17' data-thousands='.' data-decimal='.' data-prefix='R$ '></td></tr>");
        $(".valor").maskMoney();
        break;
        
        case "btnRemover":
        var lastRowId = $('#tb1 tr.conta_fgts:last').attr('id');			
        if (lastRowId == "tr_1"){return false}
        $("#tb1 > tbody").children("#"+lastRowId).remove();
        $(".valor").maskMoney();
        break;
      }
    });
    //**************************************************************
    
    //********************  HABILITAR RESIZABLE NOS CAMPOS
    $('.select_resizable').change(function(){
      $(".width_tmp_option").html($('.select_resizable option:selected').text());
      $(this).width($(".width_tmp_select").width()-14);
    });
    //**************************************************************
    
    //******************** FUNÇÃO PARA DETERMINAR OS TEXTOS DA MODAL
    $('.modal-popup').click(function(){
      var modalName = $(this).attr('id');
      
      if($("#"+modalName).is(":checked")){
        switch(modalName){
          case 'chkocupacao3'://SE SELECIONOU APOSENTADO
          var txtModal = "Caso possua emprego ativo com rendimento superior ao da aposentadoria/pensão, selecionar a 1ª opção.";
          $('#modal-body-text').text(txtModal);
          $('#minha-modal').modal('show');
          break;
          
          //case 'chkresidencia1':
          case 'chkresxxx':
          var txtModal = "No caso de aquisição pela RESIDÊNCIA, não é permitida a propriedade, posse, promessa de compra, usufruto ou cessão de imóvel residencial urbano, concluído ou em construção, no município de residência atual ou no município da ocupação principal, inclusive nos municípios limítrofes e integrantes da mesma Região Metropolitana.";
          $('#modal-body-text').text(txtModal);
          $('#minha-modal').modal('show');
          break;
          
          case 'chkresidencia2'://SE NÃO POSSUI IMÓVEL
          var txtModal = "Não é permitida a propriedade, posse, promessa de compra, usufruto ou cessão de imóvel residencial urbano ou de parte residencial de imóvel misto, concluído ou em construção, no município da sua ocupação laboral principal nem da sua residência atual, inclusive nos municípios limítrofes e integrantes da mesma Região Metropolitana.";
          $('#modal-body-text').text(txtModal);
          $('#minha-modal').modal('show');
          break;
        }
      }
      
      if ( modalName == "btImprimir") {
        var txtModal = "Após a impressão do documento, colher assinatura do(s) proponente(s) e empregado CAIXA ou Canal Parceiro, bem como colher vistos nas páginas do DAMP (exceto página de assinatura).";
        $('#modal-body-text').text(txtModal);
        $('#minha-modal').modal('show');
      }
    });
    
    //******************** MONITOR DOS VALORES DIGITADOS NAS CONTAS DO FGTS
    $('td>input.valor').keyup(function(){
      var unmk = $(".valorfgts").maskMoney('unmasked');/*retiro a mascara da classe do saldo do fgts, e coloco valor numa array*/
      var sum1 = 0;
      for (var j=0; j <= unmk.length-1; j++){
        var jArr = unmk[j];
        sum1+=parseFloat(jArr);/*soma os valores digitados*/
      }
      $('#resultado').val('R$ ' + parseFloat(sum1, 10).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1."));/*EXPRESSÃO REGULAR PARA FORMATO MONETARIO BRASILEIRO*/
    });
    
    $(document).on('keyup', "input[type='text'].valorappend",function(){	
      var unmk = $(".valorfgts").maskMoney('unmasked');
      var sum1 = 0;
      for (var j=0; j <= unmk.length-1; j++){
        var jArr = unmk[j];
        sum1+=parseFloat(jArr);/*soma os valores digitados*/
      }
      $('#resultado').val('R$ ' + parseFloat(sum1, 10).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1."));
    });
    
    function modCPFPIS( nrEvento, evento){
      var evT = "";
      switch(evento){
        case "CPF":
        var textoinicial = "O CPF "
        var textofim = "Verifique e faça a correção."
        
        $('#md-header').text(evento);
        $('#textoinicial').text(textoinicial);
        $('#nrDigitado').text(nrEvento);
        $('#textofim').text(textofim);
        $('#modalCPFPIS').modal('show');
        break;
        
        case "PIS":						
        var textoinicial = "O PIS "
        
        $('#md-header').text(evento);
        $('#textoinicial').text(textoinicial);
        $('#nrDigitado').text(nrEvento);
        $('#textofim').text("");
        $('#modalCPFPIS').modal('show');						
        break;
      }
    }				
    
    // Verificando dados de configuração da DAMP
    try{
      const armazenados = JSON.parse(localStorage.getItem('damp-settings'));
      
      if(armazenados !== null && armazenados.length !== 0){
        if(armazenados['chk_autocomplete'] !== undefined && typeof armazenados['chk_autocomplete'] === 'boolean'){
          controleAutocomplete(armazenados['chk_autocomplete']);
          $('#chk_autocomplete').prop('checked', armazenados['chk_autocomplete']);
        }else{
          controleAutocomplete(true);
          $('#chk_autocomplete').prop('checked', true);
        }
        
        if(armazenados['chk_scale_print'] !== undefined && typeof armazenados['chk_scale_print'] === 'boolean'){
          controleEscalaImpressao(armazenados['chk_scale_print']);
          $('#chk_scale_print').prop('checked', armazenados['chk_scale_print']);
        }else{
          controleEscalaImpressao(false);
          $('#chk_scale_print').prop('checked', false);
        }
      }else{
        try{
          const option = new Object();
          option['chk_autocomplete'] = true;
          option['chk_scale_print'] = false;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        }catch(error){
          console.log('Um erro ocorreu ao inicializar as configurações da DAMP. Erro:', error)
        }
        
        controleAutocomplete(true);
        $('#chk_autocomplete').prop('checked', true);
        controleEscalaImpressao(false);
        $('#chk_scale_print').prop('checked', false);
      }
      
    }catch(error){
      console.log('Um erro ocorreu ao verificar as configurações da DAMP. Erro:', error)
    }
  });
  //FIM DO DOCUMENT READY
  
  // Preenchendo a data e o local de assinatura
  window.addEventListener('DOMContentLoaded', () => {
    // Definindo data
    const date = new Date().toLocaleDateString('pt-BR');
    if(new RegExp('(?<dia>[0-9]{2})\/(?<mês>[0-9]{2})\/(?<ano>[0-9]{4})').test(date)){
      let {dia, mes, ano} = date.match(/(?<dia>[0-9]{2})\/(?<mes>[0-9]{2})\/(?<ano>[0-9]{4})/).groups;
      
      $('#end_camp').val(`${dia}`);
      $('[data-input="mes_assin"]').val(` ${converterParaMesBRL(mes).toUpperCase()} `);
      $('[data-input="ano_assin"]').val(`${ano}`);
    }

    // Definindo local de assinatura padrão
    $('#local_assin').val('Belo Horizonte'.toUpperCase());
    
    // Verificando se existem parâmetros que foram definidos
    try {
      if(true){
        const URLParams = new URLSearchParams(new URL(window.location).search);
        const dadosURL = new Object();
        let dado;
        
        for (dado of Array.from(URLParams)){
          dadosURL[dado[0]] = dado[1];
        }
        
        recuperarDados(dadosURL);
      }
    } catch (error) {
      console.log("Um erro ocorreu ao tentar recuperar os dados passado por parâmetro. Erro: %s", error);
    }
  })
  
  // Monitoramento de eventos

  /*SELECT MONITOR*/			
  $(document).on('change','#selectEstCiv',function(){
    verificaEstadoCivil($(this).val(), this);
  });
  
  $('#end_comp_logradouro').click(function(){
    $('#end_comp_bairro').slideToggle(600);				
    $('#mostrarCampoEnd').slideToggle(600);
  });

  // Monitoramento de preench. do campo de logradouro, N.º, CEP
  let timeout;
  $('[data-input="endereco_logradouro"]').on('keydown', () => {
    // Verifica se o campo está preenchido
    if($('[data-input="endereco_logradouro"]').text().trim().length == 0){
      // Se estiver, desativa o timeout e aciona a função de impedir impressão
      clearTimeout(timeout);
      exports.noPrintSettings();
    }else{
      // Se preenchido, desativa o timeout e atribui a variável um novo timeout que aciona a validação de impressão
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        exports.HabilitaImpressao();
      }, 3500);
    }
  }) 
  
  /*CHECKBOX MONITOR*/
  $('input[type="checkbox"]').click(function(){
    var chkID = $(this).attr('id');
    var chkClass = $(this).attr('class');
    var gparent = $(this).parent().parent().attr('id');
    var chldCount = $('#'+gparent).find('input[type=checkbox]').length;
    var chldCountEnq = $('#'+gparent).find('input[type=checkbox].enquad').length;
    
    try{
      var classYESNO = (chkClass.indexOf("yesno") >= 0)
    }catch(error){}
    
    if(!['chk_autocomplete', 'chk_scale_print'].includes(this.getAttribute('id'))){
      if (chkClass !="yesno" && classYESNO === false){				
        if (gparent == "enquadramento"){var chldCount = chldCountEnq;}
        
        if ($("#"+chkID).is(":checked")){
          for (var i=1; i <= chldCount; i++){
            var hddDiv = "#"+gparent+i;
            var hddchk = "#chk"+gparent+i;
            if (!$(hddchk).is(":checked")){
              $(hddchk).prop('checked', false);
              $(hddDiv).hide(400);//ou toggle. tanto faz
            }						
            if (gparent == "enquadramento" && ($(hddchk).is(":checked"))){$("#boxenq"+i).show(400);}
          }
        }else{
          for (var i = 1 ; i <= chldCount; i++){
            var hddDiv = "#"+gparent+i;
            var hddchk = "#chk"+gparent+i;
            $(hddchk).prop('checked', false);
            $(hddDiv).show(400);//ou toggle. tanto faz
            if (gparent == "enquadramento" && (!$(hddchk).is(":checked"))){$("#boxenq"+i).hide(400);}
          }
        }
      }
      
      if (classYESNO === true){
        var numIndexA = parseInt(chkID.split("_")[1]);
        var chkname = chkID.split("_")[0];
        var num = numIndexA;
        var numIndexB = num;
        if ((numIndexA % 2) == 0){numIndexB--;}else{numIndexB++;}
        
        if ($("#"+chkID).is(":checked")){
          var thisCheck = '#'+chkID;
          var thisSpan = '#span_'+numIndexA;						
          var nextCheck = '#'+chkname+'_'+numIndexB;
          var nextSpan = '#span_'+numIndexB;
          
          $(thisSpan).css({"fontWeight": "bold", "color": "black"});
          $(thisCheck).prop('checked', true);
          
          $(nextSpan).css({"fontWeight": "normal", "color": "#FEFEFF"});
          $(nextCheck).prop('checked', false);
          
          $(nextSpan).hide(400);
          
          if (gparent == "usofgts" && ($('#sn_9').is(":checked"))){
            $("#tab_contasfgts").show(400);
            $("#cond_ftgs_msg").show(400);
          }
          if (gparent == "usofgts" && ($('#sn_10').is(":checked"))){
            $("#tab_contasfgts").hide(400);
            $("#cond_ftgs_msg").hide(400);
          }
        }else{
          $('#span_'+numIndexA).css({"fontWeight": "normal", "color": "black"});
          $('#span_'+numIndexA).prop('checked', false);
          $('#span_'+numIndexA).show(150);
          $('#span_'+numIndexB).css({"fontWeight": "normal", "color": "black"});
          $('#span_'+numIndexB).prop('checked', false);
          $('#span_'+numIndexB).show(150);
          
          if (gparent == "usofgts" && ((!$('#sn_10').is(":checked")) || (!$('#sn_9').is(":checked")))  ){
            $("#tab_contasfgts").hide(400);
            $("#cond_ftgs_msg").hide(400);
          }
        }
      }
      
      //REMOVE O QUE FOI PREENCHIDO DENTRO DO CONTAINER AO QUAL SE ENCERRA CASO CHKBOX SEJA DESMARCADO
      if (!$("#"+chkID).is(":checked")){			
        $(this).parent().find('input:text').val('');				
      }				
      
      /*CONDIÇÕES ESPECIAIS PARA OS CHECKS, SE ELAS HOUVEREM*/
      switch(chkID){
        case "chkusufruto2":/*SE FOR USUFRUTUÁRIO, ABRE O COMPLEMENTO PARA INFORMAR O MUNICIPIO DO IMOVEL*/
        $('#municipio_usufruto').toggle(400);
        if (!$("#"+chkID).is(":checked")){
          $('#mun_usufruto').val('');
          $('#uf_usufruto').val('');
        }
        break;
        case "":
        break;
        case "":
        break;
      }
    }else{
      const armazenados = JSON.parse(localStorage.getItem('damp-settings'));
      
      try{
        if(armazenados === null || armazenados.length === 0){
          const option = new Object()
          option[this.getAttribute('id').trim().toLowerCase()] = this.checked;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        }else{
          const option = armazenados;
          option[this.getAttribute('id').trim().toLowerCase()] = this.checked;
          localStorage.setItem('damp-settings', JSON.stringify(option));
        }
        
        switch(this.getAttribute('id').trim().toLowerCase()){
          case 'chk_autocomplete':
          controleAutocomplete(this.checked);
          break;
          
          case 'chk_scale_print':
          controleEscalaImpressao(this.checked);
          break;
        }
      }catch(error){
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
    if(![null, undefined].includes(idIndexPaginationButton)){
      // Alterando class active
      Array.from($(".pagination-page")).forEach((page, index) => index !== idIndexPaginationButton ? page.classList.remove("active") : page.classList.add("active"));
    }else{
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
  $('input').change(function(){
    var chkID = $(this).attr('id');
    
    if(!['chk_autocomplete', 'chk_scale_print'].includes(this.getAttribute('id'))){
      HabilitaImpressao(chkID);
    }
  });
  
  // Aciona funções para impressão
  function printWindow(){	
    ocultarElementosEnquantoImprime();
    window.print();	
    salvarRegistro();
    exibirElementoDepoisImpressao();
  }
  
  // Definindo as funções globais, para acesso via eventos no HTML
  window.printWindow = printWindow;
  window.recuperarRegistroSalvo = recuperarRegistroSalvo;
  window.apagarRegistroSalvo = apagarRegistroSalvo;
  
})();