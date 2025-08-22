function limparFormDamp() {
  const form = document.querySelector("form#damp_form");
  if (form) {
    form.reset();
    form.querySelectorAll("[contenteditable='true']")?.forEach(c => c.innerHTML = "");
  }
}

const ajustarLarguraInputAoConteudo = (elementoInput) => {
  // Garante que estamos trabalhando com o elemento DOM nativo
  const input = elementoInput instanceof $ ? elementoInput[0] : elementoInput;

  // 1. Cria um elemento <span> temporário para medir o texto
  const spanMedidor = document.createElement("span");

  // 2. Obtém os estilos computados do input que afetam a largura do texto
  const estilosInput = window.getComputedStyle(input);

  // Copia os estilos essenciais para o span. A propriedade 'font' é um atalho útil.
  spanMedidor.style.font = estilosInput.font;
  spanMedidor.style.letterSpacing = estilosInput.letterSpacing;
  spanMedidor.style.textTransform = estilosInput.textTransform;
  spanMedidor.style.wordSpacing = estilosInput.wordSpacing;

  // 3. Configura o span para ser invisível e não quebrar linha
  spanMedidor.style.position = "absolute";
  spanMedidor.style.visibility = "hidden";
  spanMedidor.style.height = "auto";
  spanMedidor.style.width = "auto";
  spanMedidor.style.whiteSpace = "pre"; // Crucial para medir em uma única linha

  // 4. Define o texto do span como o valor do input
  // Usa o 'placeholder' como fallback se o valor estiver vazio
  spanMedidor.textContent = input.value || input.placeholder;

  // 5. Adiciona o span ao corpo do documento para que ele possa ser medido
  document.body.appendChild(spanMedidor);

  // 6. Mede a largura exata do span e adiciona um pequeno buffer (ex: para o cursor)
  const larguraTexto = spanMedidor.getBoundingClientRect().width;
  const novaLargura = Math.ceil(larguraTexto) + 5; // +5px de buffer

  // 7. Remove o span temporário do DOM
  document.body.removeChild(spanMedidor);

  // 8. Aplica a nova largura ao input
  input.style.width = `${novaLargura}px`;
};

export {
  limparFormDamp,
  ajustarLarguraInputAoConteudo
}