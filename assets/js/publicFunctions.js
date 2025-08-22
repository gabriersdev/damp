const converterParaMesBRL = (numero) => {
  try {
    numero = parseInt(numero);
    if (typeof numero == 'number') {
      let mes = null;
      switch (numero) {
        case 1:
          mes = 'janeiro';
          break;
        case 2:
          mes = 'fevereiro';
          break;
        case 3:
          mes = 'março';
          break;
        case 4:
          mes = 'abril';
          break;
        case 5:
          mes = 'maio';
          break;
        case 6:
          mes = 'junho';
          break;
        case 7:
          mes = 'julho';
          break;
        case 8:
          mes = 'agosto';
          break;
        case 9:
          mes = 'setembro';
          break;
        case 10:
          mes = 'outubro';
          break;
        case 11:
          mes = 'novembro';
          break;
        case 12:
          mes = 'dezembro';
          break;
        default:
          mes = 'janeiro';
          break;
      }

      return mes;
    } else {
      return '';
    }
  } catch (error) {
    console.warn('O valor informado não é um número');
    return '';
  }
}

function verificaEstadoCivil(valor, elemento) {
  switch (valor) {
    case "casado":
      $('#uniaoestavel').hide(400);
      $('#regime').show(400);
      $('#estadocivil').show(400);
      break;
    case "solteiro":
    case "viuvo":
    case "divorciado":
      $('#selectRegime').prop('selectedIndex', 0);
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

function HabilitaImpressao(chkClicado) {
  var emptyText = "";

  if ($('#text_nome').length > 0) {
    if ($('#text_nome').val() == "") {
      $('#text_nome').focus();
      noPrintSettings();
      return false;
    }
  }

  if ($('#text_data1').length > 0) {
    if ($('#text_data1').val() == "") {
      $('#text_data1').focus();
      noPrintSettings();
      return false;
    }
  }

  if ($('#text_cpf').length > 0) {
    if ($('#text_cpf').val() == "") {
      $('#text_cpf').focus();
      noPrintSettings();
      return false;
    }
  }

  /*ESTADO CIVIL*/
  var optEstCivValue = "";
  $('#selectEstCiv').each(function () {
    optEstCivValue = $(this).val();
  });

  switch (optEstCivValue) {
    case ""://opção default
      $('#btImprimir').prop("disabled", true);
      $('#print_area').addClass('no-print-allowed');
      return false;
      break;
    case "casado"://se casado
      if ($('#text_regime').val() == "") {
        $('#text_regime').focus();
        noPrintSettings();
        return false;
      }

      if ($('#text_data2').val() == "") {
        $('#text_data2').focus();
        noPrintSettings();
        return false;
      }
      break;

    case "solteiro":
    case "viuvo":
    case "divorciado":
      if ((!$('#chkuniaoestavel1').is(':checked')) && (!$('#chkuniaoestavel2').is(':checked'))) {
        $('#selectEstCiv').focus();
        noPrintSettings();
        return false;
      }

      if ($('#chkuniaoestavel1').is(':checked')) {
        if ($('#text_data3').val() == "") {
          $('#text_data3').focus();
          noPrintSettings();
          return false;
        }
      } else if ($('#chkuniaoestavel2').is(':checked')) {
        $('#uniaoestavel1').hide(400);
      } else if ($('#chkuniaoestavel1').is(':checked')) {
        $('#uniaoestavel2').hide(400);
      }
      break
  }
  /*--------------------------------------*/

  /*-------------OCUPACAO---------------*/
  if (!$('#chkocupacao1').is(':checked') && !$('#chkocupacao2').is(':checked') && !$('#chkocupacao3').is(':checked')) {
    noPrintSettings();
    return false;
  } else {
    if ($('#chkocupacao1').is(':checked')) {
      $('#ocupacao1').show(400);
      $('#ocupacao2').hide(400);
      $('#ocupacao3').hide(400);
    } else if ($('#chkocupacao2').is(':checked')) {
      $('#ocupacao1').hide(400);
      $('#ocupacao2').show(400);
      $('#ocupacao3').hide(400);
    } else if ($('#chkocupacao3').is(':checked')) {
      $('#ocupacao1').hide(400);
      $('#ocupacao2').hide(400);
      $('#ocupacao3').show(400);
    }
  }

  if ($('#chkocupacao1').is(':checked')) {
    if ($('#text_ocupacao').val() == "") {
      $('#text_ocupacao').focus();
      noPrintSettings();
      return false;
    }
    if ($('#text_localocupa').val() == "") {
      $('#text_localocupa').focus();
      noPrintSettings();
      return false;
    }
    if ($('#text_uf0').length > 0) {
      if ($('#text_uf0').val() == "") {
        $('#text_uf0').focus();
        noPrintSettings();
        return false;
      }
    }
  }
  /*--------------------------------------*/

  /*-------- 03 - RESIDENCIA------------------*/
  if ($('#text_logradouro').length > 0) {
    if ($('#text_logradouro').val() == "") {
      $('#text_logradouro').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#text_uf1').length > 0) {
    if ($('#text_uf1').val() == "") {
      $('#text_uf1').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#text_compl1').length > 0) {
    if ($('#text_compl1').val() == "") {
      $('#text_compl1').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#text_compl2').length > 0) {
    if ($('#text_compl2').val() == "") {
      $('#text_compl2').focus();
      noPrintSettings();
      return false;
    }
  }
  if (!$('#chkresidencia1').is(':checked') && !$('#chkresidencia2').is(':checked')) {
    noPrintSettings();
    return false;
  }
  if ($('#chkresidencia2').is(':checked')) {
    if ($('#text_possuiimovellocal').val() == "") {
      $('#text_possuiimovellocal').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkresidencia2').is(':checked')) {
    $('#residencia1').hide(400);
    $('#residencia2').show(400);
  }
  if ($('#chkresidencia1').is(':checked')) {
    $('#residencia1').show(400);
    $('#residencia2').hide(400);
  }
  /*--------------------------------------*/

  /*----------------04 - IR ---------------*/
  if (!$('#chkir1').is(':checked') && !$('#chkir2').is(':checked')) {
    noPrintSettings();
    return false;
  }
  if ($('#chkir1').is(':checked')) {
    $('#ir1').show(400);
    $('#ir2').hide(400);

    if ($('#text_irano1').val() == "") {
      $('#text_irano1').focus();
      noPrintSettings();
      return false;
    }
    if ($('#text_irexerc1').val() == "") {
      $('#text_irexerc1').focus();
      noPrintSettings();
      return false;
    }
  }

  if ($('#chkir2').is(':checked')) {
    $('#ir1').hide(400);
    $('#ir2').show(400);

    if ($('#text_irano2').val() == "") {
      $('#text_irano2').focus();
      noPrintSettings();
      return false;
    }
    if ($('#text_irexerc2').val() == "") {
      $('#text_irexerc2').focus();
      noPrintSettings();
      return false;
    }
  }
  /*-----------------------------------------*/

  /*- 5 IMÓVEL OBJETO DO FINANCIAMENTO-*/
  // Campo de preench. de logradouro, N.º, CEP
  if ($('[data-input="endereco_logradouro"]').text().trim().length == 0) {
    noPrintSettings();
    return false;
  }

  if ($('#text_logradouro2').length > 0) {
    if ($('#text_logradouro2').val() == "") {
      $('#text_logradouro2').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#text_uf2').length > 0) {
    if ($('#text_uf2').val() == "") {
      $('#text_uf2').focus();
      noPrintSettings();
      return false;
    }
  }


  /*----------- 6 USUFRUTO --------------*/
  if (!$('#chkusufruto1').is(':checked') && !$('#chkusufruto2').is(':checked')) {
    noPrintSettings();
    return false;
  }
  if ($('#chkusufruto2').is(':checked')) {
    if ($('#mun_usufruto').val() == "") {
      $('#mun_usufruto').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkusufruto2').is(':checked')) {
    if ($('#uf_usufruto').val() == "") {
      $('#uf_usufruto').focus();
      noPrintSettings();
      return false;
    }
  }

  if ($('#chkusufruto1').is(':checked')) {
    $('#usufruto1').show(400);
    $('#usufruto2').hide(400);
  } else if ($('#chkusufruto2').is(':checked')) {
    $('#usufruto1').hide(400);
    $('#usufruto2').show(400);
  }
  /*--------------------------------------*/

  /*--------- 7 MODALIDADE  ------------*/
  if (!$('#chkmodalidade1').is(':checked') && !$('#chkmodalidade2').is(':checked') && !$('#chkmodalidade3').is(':checked') && !$('#chkmodalidade4').is(':checked') && !$('#chkmodalidade5').is(':checked') && !$('#chkmodalidade6').is(':checked') && !$('#chkmodalidade7').is(':checked')) {
    noPrintSettings();
    return false;
  }
  if ($('#chkmodalidade1').is(':checked')) {
    if ($('#text_enquad1').val() == "") {
      $('#text_enquad1').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade2').is(':checked')) {
    if ($('#text_enquad2').val() == "") {
      $('#text_enquad2').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade3').is(':checked')) {
    if ($('#text_enquad3').val() == "") {
      $('#text_enquad3').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade4').is(':checked')) {
    if ($('#text_enquad4').val() == "") {
      $('#text_enquad4').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade5').is(':checked')) {
    if ($('#text_enquad5').val() == "") {
      $('#text_enquad5').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade6').is(':checked')) {
    if ($('#text_enquad6').val() == "") {
      $('#text_enquad6').focus();
      noPrintSettings();
      return false;
    }
  }
  if ($('#chkmodalidade7').is(':checked')) {
    if ($('#text_enquad7').val() == "") {
      $('#text_enquad7').focus();
      noPrintSettings();
      return false;
    }
  }

  const modalidade = document.querySelector('#modalidade');
  modalidade.querySelectorAll('input[type=checkbox]').forEach((input, index) => {
    if (!input.checked) {
      $(input.closest(`#modalidade${index + 1}`)).hide(300);
    } else {
      $(input.closest(`#modalidade${index + 1}`)).show(300);
    }
  })

  /*--------------------------------------*/

  /*------  8 ENQUADRAMENTO  ------------*/
  var flag1 = false;
  var flag2 = false;

  if (!$('#chkenquadramento1').is(':checked') && !$('#chkenquadramento2').is(':checked') && !$('#chkenquadramento3').is(':checked') && !$('#chkenquadramento4').is(':checked') && !$('#chkenquadramento5').is(':checked') && !$('#chkenquadramento6').is(':checked') && !$('#chkenquadramento7').is(':checked')) {
    noPrintSettings();
    return false;
  }

  if ($('#chkenquadramento1').is(':checked')) {
    if ($('#sn_1').is(':checked') && !$('#sn_2').is(':checked')) {
      flag1 = true;
    } else if (!$('#sn_1').is(':checked') && $('#sn_2').is(':checked')) {
      flag1 = true;
    } else {
      flag1 = false;
    }

    if ($('#sn_1').is(':checked')) {
      $('#span_1').show('400');
      $('#span_2').hide('400');
    } else if ($('#sn_2').is(':checked')) {
      $('#span_1').hide('400');
      $('#span_2').show('400');
    }

    if ($('#sn_3').is(':checked') && !$('#sn_4').is(':checked')) {
      flag2 = true;
    } else if (!$('#sn_3').is(':checked') && $('#sn_4').is(':checked')) {
      flag2 = true;
    } else {
      flag2 = false;
    }
    if ((flag1 === false) || (flag2 === false)) {
      noPrintSettings();
      return false;
    }

    if ($('#sn_3').is(':checked')) {
      $('#span_3').show('400');
      $('#span_4').hide('400');
    } else if ($('#sn_4').is(':checked')) {
      $('#span_3').hide('400');
      $('#span_4').show('400');
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
  if ($('#chkenquadramento4').is(':checked')) {
    if (!$('#sn_7').is(':checked') && !$('#sn_8').is(':checked')) {
      noPrintSettings();
      return false;
    }
  }

  const enquadramento = document.querySelector('#enquadramento');
  enquadramento.querySelectorAll('input[type=checkbox].enquad').forEach((input, index) => {
    const div_enquadramento = input.closest(`#enquadramento${index + 1}`);
    if (!input.checked) {
      $(div_enquadramento).hide(400);
    } else {
      $(div_enquadramento.querySelector(`#boxenq${index + 1}`)).show(400);
    }
  });

  [
    'chkenquadramento1',
    'chkenquadramento2',
    'chkenquadramento3',
    'chkenquadramento4',
    'chkenquadramento5',
    'chkenquadramento6'
  ].forEach((chk) => {
    const checkbox = enquadramento.querySelector(`#${chk}`);
    ![null, undefined].includes(checkbox) ? checkbox.checked ? $(checkbox.closest(".recuo20")).show(300) : $(checkbox.closest(".recuo20")).hide(300) : '';
  })

  // FGTS Futuro
  if (!$('#sn_11').is(':checked') && !$('#sn_12').is(':checked')) {
    $('#span_11').show(400);
    $('#span_12').show(400);
    noPrintSettings();
    return false;
  } else if ($('#sn_11').is(':checked')) {
    $('#span_11').show(400);
    $('#span_12').hide(400);
  } else if ($('#sn_12').is(':checked')) {
    $('#span_11').hide(400);
    $('#span_12').show(400);
  }

  /*--------------------------------------*/

  /*---- USO DO FGTS---------------------*/
  if (!$('#sn_9').is(':checked') && !$('#sn_10').is(':checked')) {
    $('#tab_contasfgts').hide(400);
    noPrintSettings();
    return false;
  }

  // Se usa FGTS
  if ($('#sn_9').is(':checked')) {
    $('#tab_contasfgts').show(400);

    if (!$('#chk_autoriza_saque').is(':checked')) {
      noPrintSettings();
      return false;
    }
    if ($('#first_field').val() == "") {
      noPrintSettings();
      return false;
    }

    if ($('#resultado').val() == "") {
      $('#resultado').focus();
      noPrintSettings();
      return false;
    }
  }

  if ($('#sn_10').is(':checked')) {
    $('#span_9').hide('400');
    $('#span_10').show('400');
  } else if ($('#sn_9').is(':checked')) {
    $('#span_9').show('400');
    $('#span_10').hide('400');
  }

  // Permite impressão
  okPrintSettings();
  OK = true;

  return true;
}

function noPrintSettings() {
  $('#btImprimir').prop("disabled", true);
  $('#print_area').addClass('no-print-allowed');
  $('#btImprimir').removeClass("btn-success");
  $('#btImprimir').addClass("btn-danger");
}

function okPrintSettings() {
  $('#btImprimir').prop("disabled", false);
  $('#print_area').removeClass('no-print-allowed');
  $('#btImprimir').addClass("btn-success");
  $('#btImprimir').removeClass("btn-danger");
}

function msieversion() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var navegador = "";

  if (msie > 0) {//If Internet Explorer, return version number
    $('#nav_incomp_fulllname').text(ua);
    $('#navegador_incompativel').show();

  } else if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    $('#nav_incomp_fulllname').text(ua);
    $('#navegador_incompativel').show();

  } else {// If another browser, return 0
    $('#print_area').show();
  }
  return false;
}

function ocultarElementosEnquantoImprime() {
  $('#printdiv').hide();
}

function exibirElementoDepoisImpressao() {
  $('#printdiv').show();
}

function vercpf(cpf) {
  var cpf = cpf.replace(".", "");
  var cpf = cpf.replace(".", "");
  var cpf = cpf.replace(".", "");
  var cpf = cpf.replace("-", "");
  if (cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999") {
    return false;
  }

  let add = 0;
  let rev;

  for (let i = 0; i < 9; i++) {
    add += parseInt(cpf.charAt(i)) * (10 - i);
  }

  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) {
    rev = 0;
  }

  if (rev != parseInt(cpf.charAt(9))) {
    return false;
  }

  add = 0;
  for (let i = 0; i < 10; i++) {
    add += parseInt(cpf.charAt(i)) * (11 - i);
  }

  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) {
    rev = 0;
  }
  if (rev != parseInt(cpf.charAt(10))) {
    return false;
  }
  return true;
}

function verpis(pis) {
  var multiplicadorBase = "3298765432";
  var total = 0;
  let multiplicando;
  let multiplicador;
  let resto;
  let digito;
  let pisTratado;

  pisTratado = pis;
  pisTratado = pisTratado.replace(".", "");
  pisTratado = pisTratado.replace(".", "");
  pisTratado = pisTratado.replace(".", "");
  pisTratado = pisTratado.replace("-", "");
  if (pisTratado.length != 11 || pisTratado == "00000000000" || pisTratado == "11111111111" || pisTratado == "22222222222" || pisTratado == "33333333333" || pisTratado == "44444444444" || pisTratado == "55555555555" || pisTratado == "66666666666" || pisTratado == "77777777777" || pisTratado == "88888888888" || pisTratado == "99999999999") {
    return false;
  }
  for (var i = 0; i < 10; i++) {
    multiplicando = parseInt(pisTratado.substring(i, i + 1));
    multiplicador = parseInt(multiplicadorBase.substring(i, i + 1));
    total += multiplicando * multiplicador;
  }
  resto = 11 - total % 11;
  resto = resto == 10 || resto == 11 ? 0 : resto;
  digito = parseInt("" + pisTratado.charAt(10));
  return true;
}

function dataTimestampToBRL(timestamp) {
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

function dataBRLToTimestamp(data) {
  const datax = data.replaceAll('/', '').replaceAll('-', '');
  return new Date(datax.substr(4, 4), datax.substr(0, 2), datax.substr(2, 2)).getTime();
}

function controleAutocomplete(condicao) {
  condicao ? $('input').prop('autocomplete', 'on') : $('input').prop('autocomplete', 'off');
}

function controleEscalaImpressao(condicao) {
  condicao ? $('html').prop('style', '--zoom: 1.5') : $('html').prop('style', '--zoom: 1');
}

function controlePreenchimentoAnosIR(condicao) {
  if (condicao) {
    const nw = new Date();
    // Definindo ano base e referência do IRPF
    if (nw.getTime() < new Date(`${nw.getFullYear()}-03-15T00:00:00`).getTime()) {
      // Verifica se a data é anterior à 14/03. Se for, preenche com os dados de IR do ano anterior
      $('[data-input="text_irano1"], [data-input="text_irano2"]').val(nw.getFullYear() - 2);
      $('[data-input="text_irexerc1"], [data-input="text_irexerc2"]').val(nw.getFullYear() - 1);
    } else {
      // Se não for, preenche com os dados do ano corrente
      $('[data-input="text_irano1"], [data-input="text_irano2"]').val(nw.getFullYear() - 1);
      $('[data-input="text_irexerc1"], [data-input="text_irexerc2"]').val(nw.getFullYear());
    }
  }
}

const verificaAutImpressao = (OK, e) => {
  if (e === undefined) {
    if (OK === true) {
      printWindow();
    } else {
      alert('Ainda existem campos necessários que não foram preenchidos. Preencha-os para continuar.');
      return false;
    }
  } else if (e.ctrlKey && (e.keyCode === 80)) {
    if (OK === true) {
      printWindow();
    } else {
      alert('Ainda existem campos necessários que não foram preenchidos. Preencha-os para continuar.');
      return false;
    }
  }
}

let OK = false;

const isOK = (cond) => {
  if ([true, false].includes(cond)) OK = cond;
  return OK;
}

export {
  converterParaMesBRL,
  verificaEstadoCivil,
  HabilitaImpressao,
  noPrintSettings,
  okPrintSettings,
  msieversion,
  ocultarElementosEnquantoImprime,
  exibirElementoDepoisImpressao,
  vercpf,
  verpis,
  dataTimestampToBRL,
  dataBRLToTimestamp,
  controleAutocomplete,
  controleEscalaImpressao,
  controlePreenchimentoAnosIR,
  verificaAutImpressao,
  isOK,
}
