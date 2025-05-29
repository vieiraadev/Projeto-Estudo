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
fetch('/Projeto-Planner/Project/php/listar_disciplinas.php')
    .then(response => response.json())
    .then(response => {
    if (!response.sucesso) throw new Error("Falha ao carregar disciplinas");
    const disciplinas = response.disciplinas;

    const labels = disciplinas.map(d => d.nome_disciplina);
    const notas = disciplinas.map(d => parseFloat(d.nota));

    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: notas,
                backgroundColor: [
                    '#3a7ca5',
                    '#2e86de',
                    '#54a0ff',
                    '#5f27cd',
                    '#00d2d3',
                    '#ff9ff3',
                    '#feca57',
                    '#48dbfb',
                    '#1dd1a1',
                    '#ff6b6b'
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
                        font: { size: 12 }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Atualizar a lista de disciplinas com nota (se tiver essa parte também)
    const subjectList = document.querySelector(".subject-list");
    if (subjectList) {
        subjectList.innerHTML = "";
        disciplinas.forEach(d => {
            const div = document.createElement("div");
            div.className = "subject-item";
            div.innerHTML = `
                <span class="subject-name">${d.nome_disciplina}</span>
                <span class="subject-grade">${parseFloat(d.nota).toFixed(1)}</span>
            `;
            subjectList.appendChild(div);
        });
    }

})
.catch(error => {
    console.error('Erro ao carregar disciplinas:', error);
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