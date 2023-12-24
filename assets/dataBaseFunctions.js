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
      registro[elemento.dataset.input] = elemento.value.trim();
      registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
    }else{
      registro[elemento.dataset.input] = elemento.textContent.trim() || elemento.innerText.trim();
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

function carregarRegistros(){
  let registros_alterados = false;
  
  try{
    const modal = document.querySelector('#modal-registros-salvos .modal-body');
    registros_salvos = JSON.parse(localStorage.getItem('registros-armazenados'));
    
    if(registros_salvos == null && !Array.isArray(registros_salvos)){
      modal.innerHTML = `<div class="alert alert-warning"><span>Não foram encontrados registros armazenados</span></div>`
    }else{
      modal.innerHTML = `<div class="alert alert-warning"><span>Registros ordenados do mais recente para o mais antigo</span></div>`
      modal.innerHTML += `<table style="margin-top: 1.5rem;"><thead><tr><th>Proponente (nome abreviado)</th><th>Salvo em</th><th>Ação</th></tr></thead><tbody></tbody></table>`;
      
      // Ordenando os itens salvos de acordo com a data (mais novos para mais antigos) e listando
      // Exibindo apenas os 50 primeiros registros ordenados
      registros_salvos.toSorted((a, b) => {a.data_criacao - b.data_criacao}).reverse().splice(0, 50).forEach((registro, index) => {
        const data = dataTimestampToBRL(registro.data_criacao);
        const nome = registro.text_nome.toUpperCase().substr(0, 27);
        
        // Add. ID ao registro que não possui
        if(registro.id == undefined){
          registro.id = Math.floor(new Date(registro.data_criacao) * Math.random());
          registros_alterados = true;
        }
        
        modal.querySelector('table').innerHTML += `<tr data-id-registro="${registro.id || index}"><td>${nome.trim().length === 27 ? nome.trim() + "..." : nome}</td><td>${data !== 'Invalid Date' ? data : '-'}</td><td><button class="btn btn-primary recuperar-registro-salvo" onclick="recuperarRegistroSalvo(event, this)">Recuperar</button>&nbsp;<button class="btn btn-danger apagar-registro-salvo" onclick="apagarRegistroSalvo(event, this)">Apagar</button></td></tr>`;
      })
      
      // Caso tenha havido necessidade de alterar o ID, o array com o que foi alterado será armazenado no localStorage
      registros_alterados ? localStorage.setItem('registros-armazenados', JSON.stringify(registros_salvos)) : '';
    }
  }catch(error){
    const modal = document.querySelector('#modal-registros-salvos .modal-body');
    modal.innerHTML = `<div class="alert alert-warning"><span>Não foram encontrados registros armazenados</span></div>`
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
        
        if(dados == null){
          console.log('Não foi possível identificar o ID para recuperar o registro ou não existem registros salvos');
          alert('Não foi possível recuperar o registro');
          return undefined;
        }
        
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

function exportarRegistrosArmazenados(){
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
}

export{
  salvarRegistro,
  apagarRegistroSalvo,
  recuperarRegistroSalvo,
  carregarRegistros,
  exportarRegistrosArmazenados
}