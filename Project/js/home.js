document.addEventListener("DOMContentLoaded", function () {
  fetch("/Projeto-Planner/Project/php/exibir_anuncios.php")
  .then(response => response.text())
  .then(data => {
    console.log(data); // VER AQUI O HTML
    document.getElementById("carousel").innerHTML = data;
  })

    .catch(error => {
      console.error("Erro ao carregar anúncios:", error);
    });
});
fetch('/Projeto-Planner/Project/php/home.php')
        .then(response => response.json())
        .then(data => {
          if (data.nome) {
            document.getElementById('mensagem').textContent = `Olá, ${data.nome} 👋`;
          } else {
            document.getElementById('mensagem').textContent = 'Olá, visitante!';
          }
        })
        .catch(error => {
          console.error('Erro ao buscar nome:', error);
          document.getElementById('mensagem').textContent = 'Erro ao carregar nome.';
        });


