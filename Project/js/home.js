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

// Inicializar gráfico de desempenho
const ctx = document.getElementById('performanceChart').getContext('2d');
const performanceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Matemática', 'Português', 'História', 'Ciências', 'Geografia'],
        datasets: [{
            data: [8.5, 9.2, 7.8, 8.8, 7.5],
            backgroundColor: [
                '#3a7ca5',
                '#2e86de',
                '#54a0ff',
                '#5f27cd',
                '#00d2d3'
            ],
            borderWidth: 0,
            borderRadius: 4,
            spacing: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            }
        },
        cutout: '60%'
    }
});
