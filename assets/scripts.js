"use strict";

(() => {
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
  
  });//FIM DO DOCUMENT READY
  
  
  
  
  //**************************************************************
  /*SELECT MONITOR*/			
  $(document).on('change','#selectEstCiv',function(){
    verificaEstadoCivil($(this).val(), this);
  });
  
  function verificaEstadoCivil(valor, elemento){
    switch(valor){
      case "casado":
      $('#uniaoestavel').hide(400);
      $('#regime').show(400);
      $('#estadocivil').show(400);
      break;
      case "solteiro":
      case "viuvo":
      case "divorciado":
      $('#selectRegime').prop('selectedIndex',0);
      $('#uniaoestavel').show(400);
      $('#regime').hide(400);
      $('#estadocivil').show(400);						
      break;
      case "":
      $('#regime').hide(400);
      $('#uniaoestavel').hide(400);
      break;
    }
    
    $(elemento).css({width: '275px'})
  }
  
  $('#end_comp_logradouro').click(function(){
    $('#end_comp_bairro').slideToggle(600);				
    $('#mostrarCampoEnd').slideToggle(600);
  });
  
  
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
  
      // console.log(armazenados === null, armazenados.length === 0)
      // console.log(localStorage.getItem('damp-settings'))
  
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
  
      // console.log(localStorage.getItem('damp-settings'));
    }
  });
  
  function controleAutocomplete(condicao){
    condicao ? $('input').prop('autocomplete', 'on') : $('input').prop('autocomplete', 'off');
  }
  
  function controleEscalaImpressao(condicao){
    condicao ? $('html').prop('style', '--zoom: 1.5') : $('html').prop('style', '--zoom: 1');
  }
  
  $('[data-action="registros-salvos"]').click(evento => {
    carregarRegistros();
    $('#modal-registros-salvos').modal('show');
  })
  
  //********************  HABILITA A IMPRESSÃO ********************//
  $('input').change(function(){
    var chkID = $(this).attr('id');
  
    if(!['chk_autocomplete', 'chk_scale_print'].includes(this.getAttribute('id'))){
      HabilitaImpressao(chkID);
    }
  });
  
  function HabilitaImpressao(chkClicado){
    var emptyText = "";
    
    if ($('#text_nome').length > 0){
      if ($('#text_nome').val() == ""){
        $('#text_nome').focus();
        noPrintSettings();
        return false;
      }
    }
    
    if ($('#text_data1').length > 0){
      if ($('#text_data1').val() == ""){
        $('#text_data1').focus();
        noPrintSettings();
        return false;
      }
    }
    
    if ($('#text_cpf').length > 0){
      if ($('#text_cpf').val() == ""){
        $('#text_cpf').focus();
        noPrintSettings();
        return false;
      }
    }
    
    /*ESTADO CIVIL*/
    var optEstCivValue = "";
    $('#selectEstCiv').each(function(){
      optEstCivValue = $(this).val();
    });
    
    switch(optEstCivValue){
      case ""://opção default
      $('#btImprimir').prop("disabled",true);
      $('#print_area').addClass('no-print-allowed');	
      return false;	
      break;
      case "casado"://se casado
      if ($('#text_regime').val() == ""){
        $('#text_regime').focus();
        noPrintSettings();
        return false;
      }	
      
      if ($('#text_data2').val() == ""){
        $('#text_data2').focus();	
        noPrintSettings();
        return false;
      }
      break;
      
      case "solteiro":
      case "viuvo":
      case "divorciado":
      if ((!$('#chkuniaoestavel1').is(':checked')) && (!$('#chkuniaoestavel2').is(':checked'))){
        $('#selectEstCiv').focus();
        noPrintSettings();	
        return false;
      }
      
      if ($('#chkuniaoestavel1').is(':checked')){
        if ($('#text_data3').val() == ""){
          $('#text_data3').focus();
          noPrintSettings();	
          return false;
        }
      }else if($('#chkuniaoestavel2').is(':checked')){
        $('#uniaoestavel1').hide(400);
      }else if($('#chkuniaoestavel1').is(':checked')){
        $('#uniaoestavel2').hide(400);
      }
      break
    }
    /*--------------------------------------*/
    
    /*-------------OCUPACAO---------------*/
    if (!$('#chkocupacao1').is(':checked') && !$('#chkocupacao2').is(':checked') && !$('#chkocupacao3').is(':checked')){
      noPrintSettings();
      return false;
    }else{
      if($('#chkocupacao1').is(':checked')){
        $('#ocupacao2').hide(400);
        $('#ocupacao3').hide(400);
      }else if($('#chkocupacao2').is(':checked')){
        $('#ocupacao1').hide(400);
        $('#ocupacao3').hide(400);
      }else if($('#chkocupacao3').is(':checked')){
        $('#ocupacao1').hide(400);
        $('#ocupacao2').hide(400);
      }
    }
    
    if ($('#chkocupacao1').is(':checked')){
      if ($('#text_ocupacao').val() == ""){
        $('#text_ocupacao').focus();
        noPrintSettings();
        return false;
      }
      if ($('#text_localocupa').val() == ""){
        $('#text_localocupa').focus();
        noPrintSettings();
        return false;
      }
      if ($('#text_uf0').length > 0){
        if ($('#text_uf0').val() == ""){
          $('#text_uf0').focus();
          noPrintSettings();
          return false;
        }
      }
    }
    /*--------------------------------------*/		
    
    /*-------- 03 - RESIDENCIA------------------*/
    if ($('#text_logradouro').length > 0){
      if ($('#text_logradouro').val() == ""){
        $('#text_logradouro').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#text_uf1').length > 0){
      if ($('#text_uf1').val() == ""){
        $('#text_uf1').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#text_compl1').length > 0){
      if ($('#text_compl1').val() == ""){
        $('#text_compl1').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#text_compl2').length > 0){
      if ($('#text_compl2').val() == ""){
        $('#text_compl2').focus();
        noPrintSettings();
        return false;
      }
    }
    if (!$('#chkresidencia1').is(':checked') && !$('#chkresidencia2').is(':checked')){
      noPrintSettings();
      return false;
    }
    if ($('#chkresidencia2').is(':checked')){
      if ($('#text_possuiimovellocal').val() == ""){
        $('#text_possuiimovellocal').focus();
        noPrintSettings();
        return false;
      }
    }
    if($('#chkresidencia2').is(':checked')){
      $('#residencia1').hide(400);
    }
    if($('#chkresidencia1').is(':checked')){
      $('#residencia2').hide(400);
    }
    /*--------------------------------------*/
    
    /*----------------04 - IR ---------------*/
    if (!$('#chkir1').is(':checked') && !$('#chkir2').is(':checked')){
      noPrintSettings();
      return false;
    }
    if ($('#chkir1').is(':checked')){
      $('#ir2').hide(400);
      
      if ($('#text_irano1').val() == ""){
        $('#text_irano1').focus();
        noPrintSettings();
        return false;
      }
      if ($('#text_irexerc1').val() == ""){
        $('#text_irexerc1').focus();
        noPrintSettings();
        return false;
      }
    }
    
    if ($('#chkir2').is(':checked')){
      $('#ir1').hide(400);
      
      if ($('#text_irano2').val() == ""){
        $('#text_irano2').focus();
        noPrintSettings();	
        return false;
      }
      if ($('#text_irexerc2').val() == ""){
        $('#text_irexerc2').focus();
        noPrintSettings();
        return false;
      }
    }
    /*-----------------------------------------*/
    
    /*- 5 IMÓVEL OBJETO DO FINANCIAMENTO-*/
    if ($('#text_logradouro2').length > 0){
      if ($('#text_logradouro2').val() == ""){
        $('#text_logradouro2').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#text_uf2').length > 0){
      if ($('#text_uf2').val() == ""){
        $('#text_uf2').focus();
        noPrintSettings();
        return false;
      }
    }				
    
    
    /*----------- 6 USUFRUTO --------------*/
    if (!$('#chkusufruto1').is(':checked') && !$('#chkusufruto2').is(':checked')){
      noPrintSettings();
      return false;
    }
    if ($('#chkusufruto2').is(':checked')){
      if ($('#mun_usufruto').val() == ""){
        $('#mun_usufruto').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkusufruto2').is(':checked')){
      if ($('#uf_usufruto').val() == ""){
        $('#uf_usufruto').focus();
        noPrintSettings();
        return false;
      }
    }
    
    if($('#chkusufruto1').is(':checked')){
      $('#usufruto2').hide(400);
    }else if($('#chkusufruto2').is(':checked')){
      $('#usufruto1').hide(400);
    }
    /*--------------------------------------*/
    
    /*--------- 7 MODALIDADE  ------------*/		
    if (!$('#chkmodalidade1').is(':checked') && !$('#chkmodalidade2').is(':checked') && !$('#chkmodalidade3').is(':checked') && !$('#chkmodalidade4').is(':checked') && !$('#chkmodalidade5').is(':checked') && !$('#chkmodalidade6').is(':checked') && !$('#chkmodalidade7').is(':checked')){
      noPrintSettings();
      return false;
    }
    if ($('#chkmodalidade1').is(':checked')){
      if ($('#text_enquad1').val() == ""){
        $('#text_enquad1').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade2').is(':checked')){
      if ($('#text_enquad2').val() == ""){
        $('#text_enquad2').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade3').is(':checked')){
      if ($('#text_enquad3').val() == ""){
        $('#text_enquad3').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade4').is(':checked')){
      if ($('#text_enquad4').val() == ""){
        $('#text_enquad4').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade5').is(':checked')){
      if ($('#text_enquad5').val() == ""){
        $('#text_enquad5').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade6').is(':checked')){
      if ($('#text_enquad6').val() == ""){
        $('#text_enquad6').focus();
        noPrintSettings();
        return false;
      }
    }
    if ($('#chkmodalidade7').is(':checked')){
      if ($('#text_enquad7').val() == ""){
        $('#text_enquad7').focus();
        noPrintSettings();
        return false;
      }
    }
    
    const modalidade = document.querySelector('#modalidade');
    modalidade.querySelectorAll('input[type=checkbox]').forEach((input, index) => {
      if(!input.checked){
        $(input.closest(`#modalidade${index + 1}`)).hide(300);
      }
    })
    
    /*--------------------------------------*/
    
    /*------  8 ENQUADRAMENTO  ------------*/
    var flag1 = false;
    var flag2 = false;
    
    if (!$('#chkenquadramento1').is(':checked') && !$('#chkenquadramento2').is(':checked') && !$('#chkenquadramento3').is(':checked') && !$('#chkenquadramento4').is(':checked') && !$('#chkenquadramento5').is(':checked') && !$('#chkenquadramento6').is(':checked') && !$('#chkenquadramento7').is(':checked')){
      noPrintSettings();
      return false;
    }
    
    if ($('#chkenquadramento1').is(':checked')){
      if ($('#sn_1').is(':checked') && !$('#sn_2').is(':checked')){flag1 = true;}			
      else if (!$('#sn_1').is(':checked') && $('#sn_2').is(':checked')){flag1 = true;}
      else{flag1 = false;}
      
      if($('#sn_1').is(':checked')){
        $('#span_2').hide('400');
      }else if($('#sn_2').is(':checked')){
        $('#span_1').hide('400');
      }
      
      if ($('#sn_3').is(':checked') && !$('#sn_4').is(':checked')){flag2 = true;}
      else if (!$('#sn_3').is(':checked') && $('#sn_4').is(':checked')){flag2 = true;}
      else{flag2 = false;}
      if ( (flag1 === false) || (flag2 === false)){
        noPrintSettings();
        return false;			
      }
      
      if($('#sn_3').is(':checked')){
        $('#span_4').hide('400');
      }else if($('#sn_4').is(':checked')){
        $('#span_3').hide('400');
      }
    }
    /*---				
    if ($('#chkenquadramento2').is(':checked')){
      if (!$('#sn_5').is(':checked') && !$('#sn_6').is(':checked')){
        noPrintSettings();
        return false;		
      }
    }
    --*/
    if ($('#chkenquadramento4').is(':checked')){
      if (!$('#sn_7').is(':checked') && !$('#sn_8').is(':checked')){
        noPrintSettings();
        return false;
      }
    }
    
    const enquadramento = document.querySelector('#enquadramento');
    enquadramento.querySelectorAll('input[type=checkbox].enquad').forEach((input, index) => {
      const div_enquadramento = input.closest(`#enquadramento${index + 1}`);
      if(!input.checked){
        $(div_enquadramento).hide(400);
      }else{
        $(div_enquadramento.querySelector(`#boxenq${index + 1}`)).show(400)
      }
    })
    
    /*--------------------------------------*/		
    
    /*---- USO DO FGTS---------------------*/		
    if (!$('#sn_9').is(':checked') && !$('#sn_10').is(':checked')){
      noPrintSettings();
      return false;
    }		
    if ($('#sn_9').is(':checked')){//se usa FGTS
      if (!$('#chk_autoriza_saque').is(':checked')){
        noPrintSettings();
        return false;
      }
      if($('#first_field').val() == ""){
        noPrintSettings();
        return false;
      }
      
      if ($('#resultado').val() == ""){
        $('#resultado').focus();
        noPrintSettings();
        return false;
      }
    }
    
    if($('#sn_10').is(':checked')){
      $('#span_9').hide('400');
    }else if($('#sn_9').is(':checked')){
      $('#span_10').hide('400');
    }
    
    /*--------------------------------------*/		
    $('#print_area').removeClass('no-print-allowed');		
    $('#btImprimir').prop("disabled",false);
    $('#btImprimir').removeClass("btn-danger");
    $('#btImprimir').addClass("btn-success");
    return true;
  }
  
  function noPrintSettings(){
    $('#btImprimir').prop("disabled",true);
    $('#print_area').addClass('no-print-allowed');
    $('#btImprimir').removeClass("btn-success");
    $('#btImprimir').addClass("btn-danger");
  }

  /******************************************************************************/
  //FUNÇÕES JS			
  function msieversion(){
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var navegador = "";
    
    if (msie > 0){//If Internet Explorer, return version number
      $('#nav_incomp_fulllname').text(ua);
      $('#navegador_incompativel').show();
      
    }else if(msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
      $('#nav_incomp_fulllname').text(ua);
      $('#navegador_incompativel').show();
      
    }else{// If another browser, return 0
      $('#print_area').show();
    }
    return false;
  }
  
  function printWindow(){	
    ocultarElementosEnquantoImprime();
    window.print();	
    salvarRegistro();
    exibirElementoDepoisImpressao();
  }
  
  function ocultarElementosEnquantoImprime(){
    $('#printdiv').hide();
  }
  
  function exibirElementoDepoisImpressao(){
    $('#printdiv').show();
  }
  
  function vercpf (cpf){			
    var cpf = cpf.replace(".", "");
    var cpf = cpf.replace(".", "");
    var cpf = cpf.replace(".", "");
    var cpf = cpf.replace("-", "");				
    if (cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999") {
      return false;
    }
    
    add = 0;
    for (i=0; i < 9; i ++) {
      add += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) {
      rev = 0;
    }
    
    if (rev != parseInt(cpf.charAt(9))){
      return false;
    }
    
    add = 0;
    for (i = 0; i < 10; i ++) {
      add += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11){
      rev = 0;
    }
    if (rev != parseInt(cpf.charAt(10))){
      return false;
    }
    return true;				
  }
  
  function verpis (pis){
    var multiplicadorBase = "3298765432";
    var total = 0;
    var pis = pis.replace(".", "");
    var pis = pis.replace(".", "");
    var pis = pis.replace(".", "");
    var pis = pis.replace("-", "");				
    if (pis.length != 11 || pis == "00000000000" || pis == "11111111111" || pis == "22222222222" || pis == "33333333333" || pis == "44444444444" || pis == "55555555555" || pis == "66666666666" || pis == "77777777777" || pis == "88888888888" || pis == "99999999999"){
      return false;
    }
    for (var i = 0; i < 10; i++){
      multiplicando = parseInt( pis.substring( i, i + 1 ) );
      multiplicador = parseInt( multiplicadorBase.substring( i, i + 1 ) );
      total += multiplicando * multiplicador;
    }
    resto = 11 - total % 11;
    resto = resto == 10 || resto == 11 ? 0 : resto;
    digito = parseInt("" + pis.charAt(10));
    // return resto == digito;
    return true;
    return true;
  }
  
  // Código não implementado pelo TI da Caixa
  let registros_salvos = '';
  
  function salvarRegistro(){
    const registro = new Object();
    
    document.querySelectorAll('[data-input]').forEach((elemento) => {
      // console.log(elemento.tagName);
      const type = elemento.getAttribute('type');
      // console.log(elemento.dataset.input, elemento.value, elemento.checked)
      if(type == 'checkbox'){
        registro[elemento.dataset.input] = elemento.checked;
      }else if(type == 'text'){
        registro[elemento.dataset.input] = elemento.value.trim();
        registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
      }else if(elemento.tagName.trim().toLowerCase() == 'select'){
        registro[elemento.dataset.input] = elemento.value;
        registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
      }else{
        registro[elemento.dataset.input] = elemento.textContent || elemento.innerText;
        registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
      }
      
      registro['data_criacao'] = Date.now();
      registro['id'] = Math.floor(Date.now() * Math.random());
    })
    
    try{
      registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
      
      if(registros_salvos == null && !Array.isArray(registros_salvos)){
        registros_salvos = new Array();
      }
      
      registros_salvos.push(registro)
      localStorage.setItem('registros-armazenados', JSON.stringify(registros_salvos));
      
    }catch(error){
      console.log('Ocorreu um erro ao salvar o registro. Erro: %s', error);
    }
  }
  
  function dataTimestampToBRL(timestamp){
    return new Date(timestamp).toLocaleDateString("pt-BR");
  }
  
  function dataBRLToTimestamp(data){
    const datax = data.replaceAll('/','').replaceAll('-','');
    return new Date(datax.substr(4, 4), datax.substr(0, 2), datax.substr(2, 2)).getTime();
  }
  
  function carregarRegistros(){
    try{
      const modal = document.querySelector('#modal-registros-salvos .modal-body');
      registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
      
      if(registros_salvos == null && !Array.isArray(registros_salvos)){
        modal.innerHTML = `<div class="alert alert-warning"><span>Não foram encontrados registros armazenados</span></div>`
      }else{
        modal.innerHTML = `<div class="alert alert-warning"><span>Registros ordenados do salvo mais recente para o mais antigo</span></div>`
        modal.innerHTML += `<table style="margin-top: 1.5rem;"><thead><tr><th>Proponente (nome abreviado)</th><th>Salvo em</th><th>Ação</th></tr></thead><tbody></tbody></table>`;
        
        // Ordenando os itens salvos de acordo com a data (mais novos para mais antigos)
        registros_salvos.sort((a, b) => {a.data_criacao < b.data_criacao}).reverse();
        
        registros_salvos.forEach((registro, index) => {
          // Exibindo apenas os 50 primeiros registros
          if(index < 50){
            const data = dataTimestampToBRL(registro.data_criacao);
            const nome = registro.text_nome.toUpperCase().substr(0, 27);
            modal.querySelector('table').innerHTML += `<tr data-id-registro="${registro.id || index}"><td>${nome.length === 27 ? nome + "..." : nome}</td><td>${data !== 'Invalid Date' ? data : '-'}</td><td><button class="btn btn-primary recuperar-registro-salvo" onclick="recuperarRegistroSalvo(event, this)">Recuperar</button>&nbsp;<button class="btn btn-danger apagar-registro-salvo" onclick="apagarRegistroSalvo(event, this)">Apagar</button></td></tr>`;
          }
        })
      }
      
    }catch(error){
      console.log('Ocorreu um erro ao carregar os registros. Erro: %s', error);
    }
  }
  
  function apagarRegistroSalvo(evento, elemento){
    evento.preventDefault();
    try{
      let id = elemento.closest('[data-id-registro]').getAttribute('data-id-registro');
      registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
      let registros_atuais = new Array();
      
      if(registros_salvos == null && !Array.isArray(registros_salvos) && id == null && typeof parseInt(id) !== 'number'){
        console.log('Não foi possível identificar o ID para apagar o registro ou não existem registros salvos');
      }else{
        // Confirmar exclusão de registro
        const data = dataTimestampToBRL(registros_salvos.find((registro) => registro.id === parseInt(id)).data_criacao);
        if(confirm(`⚠️ Excluir registro\n\nConfirma a exclusão do registro criado em ${data !== 'Invalid Date' ? data : '-'} do(a) ${document.querySelector('tr[data-id-registro="' + id + '"] > td').textContent.trim().toUpperCase()}? A exclusão não é reversível.`)){
          registros_salvos.forEach((registro, index) => {
            if(registro.id !== parseInt(id)){
              registros_atuais.push(registro);
            }
          })
          
          registros_atuais !== null && Array.isArray(registros_atuais) ? localStorage.setItem('registros-armazenados', JSON.stringify(registros_atuais)) : '';
          
          carregarRegistros();
        }
      }
      
    }catch(error){
      console.log('Ocorreu um erro ao apagar o registro. Erro: %s', error);
    }
  }
  
  function recuperarRegistroSalvo(evento, elemento){
    evento.preventDefault();
    
    try{
      let id = elemento.closest('[data-id-registro]').getAttribute('data-id-registro');
      registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
      
      if(registros_salvos == null && !Array.isArray(registros_salvos) && id == null && typeof parseInt(id) !== 'number'){
        console.log('Não foi possível identificar o ID para recuperar o registro ou não existem registros salvos');
        alert('Não foi possível recuperar o registro');
      }else{
        try{
          const dados = registros_salvos.find((registro) => registro.id === parseInt(id));
          
          // Preenchendo os campos, conforme os tipos deles e os dados recuperados
          if(typeof dados == 'object' ){
            const chaves = Object.keys(dados);
            
            chaves.forEach((chave, index) => {
              const elemento = document.querySelector(`[data-input="${chave}"]`);
              const valor = dados[chave];
              
              if(elemento !== null && elemento !== undefined && valor !== null && valor !== undefined){
                const type = elemento.getAttribute('type');
                if(type == 'checkbox'){
                  elemento.checked = valor;
                }else if(type == 'text'){
                  elemento.value = valor;
                  
                  if(valor.length > 0 && elemento.dataset.input !== 'assinatura_titular' && elemento.dataset.input !== 'assinatura_caixa'){
                    elemento.setAttribute('size', valor.length);
                    // elemento.style.width = `${((valor.lzength) * 16) + 16}px`;
                    
                    if(dados[`${elemento.dataset.input}_w`] !== undefined && typeof(parseInt(dados[`${elemento.dataset.input}_w`])) == 'number'){
                      elemento.style.width = `${(dados[`${elemento.dataset.input}_w`])}px`;
                    }else if(elemento.dataset.input == 'selectRegime'){
                      elemento.style.width = '275px';
                    }else{
                      elemento.style.width = `${((valor.length) * 16) + 16}px`;
                    };
                  }
                  
                }else if(elemento.tagName.trim().toLowerCase() == 'select'){
                  elemento.value = valor;
                  
                  if(chave == 'selectEstCiv'){
                    verificaEstadoCivil(valor);
                  }
                  
                }else if(elemento.tagName.toLocaleLowerCase().trim() == 'div'){
                  elemento.textContent = valor;
                }else{
                  elemento.value = valor;
                }
              }
            })
            
            HabilitaImpressao();
            $('#modal-registros-salvos').modal('hide');
          }
          
          // Scrollando para o topo da página
          window.scrollTo({top: 0, behavior: 'smooth'});
          
        }catch(error){
          console.log('Ocorreu um erro ao recuperar os dados do registro. Erro: %s', error);
          alert('Não foi possível recuperar o registro');
        }
      }
      
    }catch(error){
      alert('Não foi possível recuperar o registro');
    }
  }
  
  $('[data-action="exportar-registros"]').on('click', (event) => {
    event.preventDefault();
    
    try{
      registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
      const saida = `${registros_salvos !== null && Array.isArray(registros_salvos) ? JSON.stringify(registros_salvos) : 'Não foram localizados registros.'}`
      console.groupCollapsed('Clique para ver os recuperados do localStorage em JSON')
      console.log(saida.trim());
      console.groupEnd();
      
      alert('Os registros foram listados em JSON no console do navegador. Acesse o console do navegador e depois copie e cole os resultados em um editor de texto.')
    }catch(error){
      console.log('Ocorreu um erro ao exportar os registros. Erro: %s', error);
    }
  })
  
  const converterParaMesBRL = (numero) => {
    try{
      numero = parseInt(numero);
      if(typeof numero == 'number'){
        let mes = null;
        switch (numero){
          case 1: mes = 'janeiro'; break;
          case 2: mes = 'fevereiro'; break;
          case 3: mes = 'março'; break;
          case 4: mes = 'abril'; break;
          case 5: mes = 'maio'; break;
          case 6: mes = 'junho'; break;
          case 7: mes = 'julho'; break;
          case 8: mes = 'agosto'; break;
          case 9: mes = 'setembro'; break;
          case 10: mes = 'outubro'; break;
          case 11: mes = 'novembro'; break;
          case 12: mes = 'dezembro'; break;
          default: mes = 'janeiro'; break;
        }
      
        return mes;
      }else{
        return '';
      }
    }catch(error){
      console.warn('O valor informado não é um número');
      return '';
    }
  }
  
  // Definindo as funções globais, para acesso via eventos no HTML
  window.msieversion = msieversion;
  window.printWindow = printWindow;
  window.recuperarRegistroSalvo = recuperarRegistroSalvo;
  window.apagarRegistroSalvo = apagarRegistroSalvo;

  // Preenchendo a data e o local de assinatura
  window.addEventListener('DOMContentLoaded', (event) => {
    const date = new Date().toLocaleDateString('pt-BR');
    if(new RegExp('(?<dia>[0-9]{2})\/(?<mês>[0-9]{2})\/(?<ano>[0-9]{4})').test(date)){
      let {dia, mes, ano} = date.match(/(?<dia>[0-9]{2})\/(?<mes>[0-9]{2})\/(?<ano>[0-9]{4})/).groups;
  
      $('#end_camp').val(`${dia}`);
      $('[data-input="mes_assin"]').val(` ${converterParaMesBRL(mes).toUpperCase()} `);
      $('[data-input="ano_assin"]').val(`${ano}`);
    }
  
    $('#local_assin').val('Belo Horizonte'.toUpperCase());
  })
})()