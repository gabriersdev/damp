function limparFormDamp() {
  const form = document.querySelector("form#damp_form");
  if (form) {
    form.reset();
    form.querySelectorAll("[contenteditable='true']")?.forEach(c => c.innerHTML = "");
  }
}

export {
  limparFormDamp
}