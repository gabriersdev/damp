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
      if(elemento.value.trim().length > 0){
        registro[elemento.dataset.input] = elemento.value.trim();
        registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
      }
    }else if(elemento.tagName.trim().toLowerCase() == 'select'){
      if(elemento.value.trim().length > 0){
        registro[elemento.dataset.input] = elemento.value.trim();
        registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
      }
    }else{
      try{
        if(elemento.textContent.trim().length > 0 || elemento.innerText.trim().length > 0){
          registro[elemento.dataset.input] = elemento.textContent.trim() || elemento.innerText.trim();
          registro[`${elemento.dataset.input}_w`] = elemento.clientWidth;
        }
      }catch(error){
        //
      }
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
    
    modal.innerHTML = '';
    document.querySelector('#modal-registros-salvos .modal-footer').innerHTML = '';

    if(registros_salvos == null && !Array.isArray(registros_salvos)){
      modal.innerHTML = `<div class="alert alert-warning"><span>Não foram encontrados registros armazenados</span></div>`
    }else{
      modal.innerHTML = `<div class="alert alert-warning"><span>Registros ordenados do mais recente para o mais antigo</span></div>`
      
      // Ordenando os itens salvos de acordo com a data (mais novos para mais antigos) e listando
      // Exibindo apenas os 50 primeiros registros ordenados
      paginarElementos(registros_salvos.toSorted((a, b) => {a.data_criacao - b.data_criacao}).reverse());
      
      [].forEach((registro, index) => {
        const data = dataTimestampToBRL(registro.data_criacao);
        const nome = registro.text_nome.toUpperCase().substr(0, 27);
        
        // Add. ID ao registro que não possui
        if(registro.id == undefined){
          registro.id = Math.floor(new Date(registro.data_criacao) * Math.random());
          registros_alterados = true;
        }
        
        modal.querySelector('table').innerHTML += `<tr data-id-registro="${registro.id || index}"><td>${nome.trim().length === 27 ? nome.trim() + "..." : nome}</td><td>${data !== 'Invalid Date' ? data : '-'}</td><td><button class="btn btn-primary recuperar-registro-salvo" onclick="recuperarRegistroSalvo(event, this)">Recuperar</button>&nbsp;<button class="btn btn-danger apagar-registro-salvo" onclick="apagarRegistroSalvo(event, this)">Apagar</button>&nbsp;<button class="btn btn-secondary" onclick="recuperarRegistroSalvo(event,this,'link')">🔗</button></td></tr>`;
      })
      
      // Caso tenha havido necessidade de alterar o ID, o array com o que foi alterado será armazenado no localStorage
      registros_alterados ? localStorage.setItem('registros-armazenados', JSON.stringify(registros_salvos)) : '';
    }
  }catch(error){
    console.log(error);
    const modal = document.querySelector('#modal-registros-salvos .modal-body');
    modal.innerHTML = `<div class="alert alert-warning"><span>Não foram encontrados registros armazenados</span></div>`
    console.log('Ocorreu um erro ao carregar os registros. Erro: %s', error);
  }
}

const paginarElementos = (elements) => {
  const modal = document.querySelector('#modal-registros-salvos');
  if(!Array.isArray(elements)){
    throw new Error('O elemento não é um array');
  }

  // Paginação
  elements.sort((a, b) => a - b);
  // Object.freeze(elements);
  
  const count = 10;
  
  if(elements.length <= count){
    // Exibir apenas 1 página
    console.log('Apenas 1 página')
  }else if(elements.length == 0 || !Array.isArray(elements)){
    // Exibir mensagem que não tem nada
    console.log('Não tem nada no array de elementos')
  }else{
    // Resolvendo paginação
    const countPagination = Math.ceil(elements.length / count);

    for (let indexPagination = 0; indexPagination < countPagination; indexPagination++) {
      // Criando DIV
      const table = document.createElement('table');
      table.style = 'margin-top: 1.5rem;';
      table.innerHTML += '<thead><tr><th>Proponente (nome abreviado)</th><th>Salvo em</th><th>Ação</th></tr></thead>'

      table.classList.add(`${indexPagination === 0 ? "visible" : "unvisible"}`);
      table.dataset.page = indexPagination;

      const tbody = document.createElement('tbody');

      // Elementos para formação de uma página da paginação
      elements.splice(0, count).forEach((registro, indexElement) => {
        const data = dataTimestampToBRL(registro.data_criacao);
        const nome = registro.text_nome.toUpperCase().substr(0, 27);

        // Inserção de página com os elementos
        tbody.innerHTML += `<tr data-element-pagination-id="${indexPagination + "" + indexElement}" data-id-registro="${registro.id || index}"><td>${nome.trim().length === 27 ? nome.trim() + "..." : nome}</td><td>${data !== 'Invalid Date' ? data : '-'}</td><td><button class="btn btn-primary recuperar-registro-salvo" onclick="recuperarRegistroSalvo(event, this)">Recuperar</button>&nbsp;<button class="btn btn-danger apagar-registro-salvo" onclick="apagarRegistroSalvo(event, this)">Apagar</button>&nbsp;<button class="btn btn-secondary" onclick="recuperarRegistroSalvo(event,this,'link')">🔗</button></td></tr>`
        table.appendChild(tbody);
      });

      modal.querySelector('.modal-body').appendChild(table);
      
      // Inserindo os botões de troca de pagina
      modal.querySelector('.modal-footer').innerHTML +=`<button class="btn ${indexPagination === 0 ? 'btn-primary'  :  'btn-default'}" data-button-pagination="${indexPagination}" onclick="clickTogglePage(event)">${indexPagination + 1}</button>`;
    }
  }
}

// Evento de click para o botão de paginação
const clickTogglePage = (evento) => {
  evento.preventDefault();
  const id = evento.target.dataset.buttonPagination;
  if(id){
    $('table[data-page]').attr('class', 'unvisible');
    $(`table[data-page=${id}]`).attr('class', 'visible');
    $('button[data-button-pagination]').attr('class', 'btn btn-default');
    evento.target.setAttribute('class', 'btn btn-primary');
  }else{
    console.log('Não foi possível capturar o identificador do botão');
  }
}

window.clickTogglePage = clickTogglePage;

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
        registros_salvos.forEach((registro) => {
          if(registro.id !== parseInt(id)){
            registros_atuais.push(registro);
          }
        })
        
        registros_atuais !== null && Array.isArray(registros_atuais) ? localStorage.setItem('registros-armazenados', JSON.stringify(registros_atuais)) : '';
        
        // Removendo a linha do registro
        elemento.closest('tr[data-element-pagination-id]').remove();
        // Carregando registros novamente no modal
        carregarRegistros();
      }
    }
    
  }catch(error){
    console.log('Ocorreu um erro ao apagar o registro. Erro: %s', error);
  }
}

const isEmpty = (valor) => {
  try{
    if(typeof valor == 'string'){
      return valor == undefined || valor == null || valor.trim().length <= 0;
    }else if(Array.isArray(valor)){
      return valor.length <= 0;
    }else if(typeof valor == 'object' && valor !== null && valor !== undefined){
      return Object.keys(valor).length <= 0;
    }else{
      return valor == undefined || valor == null
    }
  }catch(error){
    throw new Error('Ocorreu um erro ao verificar se o %s é vazio. Error: %s', typeof valor, error);
  }
}

function sanitizarStringParaURL(string){
  string = String(string);
  if(!isEmpty(string)){
    return string.trim().toLowerCase().replaceAll(' ', '+').replaceAll("\n", "[n]");
  }else{
    return '';
  }
}

function recuperarRegistroSalvo(evento, button, action){
  evento.preventDefault();
  
  try{
    let id = button.closest('[data-id-registro]').getAttribute('data-id-registro');
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
        }else{
          if(!isEmpty(action) && typeof action == "string"){
            if(action.toLowerCase().trim() == "link"){
              let saida_URL = "https://gabrieszin.github.io/damp?";
              let dado;
              
              try{
                for (dado of Object.entries(dados)){
                  if(!isEmpty(dado[1])){
                    saida_URL += `&${dado[0]}=${sanitizarStringParaURL(dado[1])}`;
                  }
                }
                
                // Caso a URL tenha mais de 2000 caracteres pode não funcionar corretamente
                if(saida_URL.length > 2000){
                  // Solicitação confirmação do usuário
                  if(confirm("A URL gerada possui mais de 2000 caracteres e pode não funcionar no navegador. Deseja gerar assim mesmo?")){
                    showLink();
                  }
                }else{
                  showLink();
                }
                
                function showLink(){
                  prompt("Segue o link para a DAMP. Copie e cole na barra de pesquisa do navegador para carregar os dados recuperados", saida_URL);
                }
              }catch(error){
                console.log("Não foi possível gerar o link da DAMP. Erro: %s", error);
                alert("Não foi possível gerar o link da DAMP");
              }
            }
            return undefined;
          }
        }
        
        // Acionando função responsável pelo carregamento do registro que foi recuperado
        carregarRegistroRecuperado(dados);
        
      }catch(error){
        console.log('Ocorreu um erro ao recuperar os dados do registro. Erro: %s', error);
        alert('Não foi possível recuperar o registro');
      }
    }
    
  }catch(error){
    alert('Não foi possível recuperar o registro');
  }
}

function recuperarDados(dados){
  try{
    carregarRegistroRecuperado(dados);
    // alert("Dados recuperados com sucesso!");
  }catch(error){
    console.log("Não foi possível recuperar os dados. Erro: %s", error);
    alert("Não foi possível recuperar os dados.");
  }
}

function carregarRegistroRecuperado(dados){
  // Preenchendo os campos, conforme os tipos deles e os dados recuperados
  if(typeof dados == 'object' ){
    const chaves = Object.keys(dados);
    
    chaves.forEach((chave, index) => {
      const elemento = document.querySelector(`[data-input="${chave}"]`);
      const valor = dados[chave];
      
      if(elemento !== null && elemento !== undefined && valor !== null && valor !== undefined){
        const type = elemento.getAttribute('type');
        if(type == 'checkbox'){
          elemento.checked = (typeof valor == "string" ? valor.toLowerCase() == "true" ? true : false : valor);
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
          
        }else if(elemento.tagName.toLowerCase().trim() == 'div'){
          elemento.textContent = String(valor).replaceAll("[n]", "\n");
        }else{
          elemento.value = String(valor).replaceAll("[n]", "\n");
        }
      }
    })
    
    HabilitaImpressao();
    $('#modal-registros-salvos').modal('hide');
  }
  
  // Scrollando para o topo da página
  window.scrollTo({top: 0, behavior: 'smooth'});
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
  recuperarDados,
  carregarRegistros,
  exportarRegistrosArmazenados
}