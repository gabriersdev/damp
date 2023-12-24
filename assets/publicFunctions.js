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

function dataTimestampToBRL(timestamp){
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

function dataBRLToTimestamp(data){
  const datax = data.replaceAll('/','').replaceAll('-','');
  return new Date(datax.substr(4, 4), datax.substr(0, 2), datax.substr(2, 2)).getTime();
}

function controleAutocomplete(condicao){
  condicao ? $('input').prop('autocomplete', 'on') : $('input').prop('autocomplete', 'off');
}

function controleEscalaImpressao(condicao){
  condicao ? $('html').prop('style', '--zoom: 1.5') : $('html').prop('style', '--zoom: 1');
}

export {
  converterParaMesBRL,
  verificaEstadoCivil,
  HabilitaImpressao,
  noPrintSettings,
  msieversion,
  ocultarElementosEnquantoImprime,
  exibirElementoDepoisImpressao,
  vercpf,
  verpis,
  dataTimestampToBRL,
  dataBRLToTimestamp,
  controleAutocomplete,
  controleEscalaImpressao
};