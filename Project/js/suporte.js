// Accordion funcionalidade
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentNode;
        accordionItem.classList.toggle('active');
    });
});

document.getElementById('duvidaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch('/Projeto-Planner/Project/php/suporte.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        document.getElementById('duvidaForm').reset();
    })
    .catch(error => {
        alert('Erro ao enviar a dúvida. Tente novamente.');
        console.error(error);
    });
});


