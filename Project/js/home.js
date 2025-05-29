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

document.addEventListener("DOMContentLoaded", () => {
  fetch('/Projeto-Planner/Project/php/tarefas_recentes.php')
      .then(response => response.json())
      .then(tarefas => {
          const lista = document.getElementById('listaTarefas');
          lista.innerHTML = '';

          if (tarefas.length === 0) {
              lista.innerHTML = "<p style='padding: 1rem;'>Nenhuma tarefa encontrada.</p>";
              return;
          }

          tarefas.forEach(tarefa => {
              const item = document.createElement('div');
              item.className = 'task-item';

              item.innerHTML = `
                  <div class="task-info">
                      <div class="task-title">${tarefa.titulo}</div>
                      <div class="task-date">${tarefa.data}</div>
                  </div>
                  <span class="task-priority priority-${tarefa.prioridade}">${tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}</span>
              `;
              lista.appendChild(item);
          });
      })
      .catch(() => {
          document.getElementById('listaTarefas').innerHTML = "<p style='padding: 1rem;'>Erro ao carregar tarefas.</p>";
      });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch('/Projeto-Planner/Project/php/respostas_recentes.php')
      .then(response => response.json())
      .then(data => {
          const container = document.getElementById('mensagens-suporte');
          container.innerHTML = '';

          const truncate = (text, limit = 60) => {
              return text.length > limit ? text.substring(0, limit) + '...' : text;
          };

          data.forEach(item => {
              const messageDiv = document.createElement('div');
              messageDiv.classList.add('message-item');

              messageDiv.innerHTML = `
                  <div class="message-info">
                      <div class="message-title">${truncate(item.resposta)}</div>
                      <div class="message-date">${new Date(item.data_envio).toLocaleString()}</div>
                  </div>
                  <span class="message-status status-read">Respondido</span>
              `;

              container.appendChild(messageDiv);
          });

          if (data.length === 0) {
              container.innerHTML = '<p>Nenhuma resposta disponível.</p>';
          }
      })
      .catch(error => {
          console.error('Erro ao carregar mensagens:', error);
      });
});