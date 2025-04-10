// Accordion funcionalidade
document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const accordionItem = button.parentNode;
        accordionItem.classList.toggle('active');
    });
});


