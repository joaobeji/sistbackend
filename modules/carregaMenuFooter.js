/**
 * - Carrega um componente HTML e o insere em um elemento específico da página.
 * - O caminho para o arquivo HTML do componente.
 * - O ID do elemento onde o componente será inserido.
 */
function carregaMenuFooter(url, elementId) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${url}: ${response.statusText}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch((error) => console.error("Erro ao carregar o componente:", error));
}

// Carregar o menu e o footer
carregaMenuFooter("menu.html", "menu");
carregaMenuFooter("footer.html", "footer");
