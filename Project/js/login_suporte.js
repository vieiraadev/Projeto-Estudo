document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("/Projeto-Planner/Project/php/login_suporte.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "sucesso") {
            Swal.fire("Login realizado!", "", "success").then(() => {
                window.location.href = "/Projeto-Planner/Project/html/duvidas.html";
            });
        } else {
            Swal.fire("Erro", data.mensagem, "error");
        }
    })
    .catch(() => {
        Swal.fire("Erro", "Erro no servidor. Tente novamente.", "error");
    });
});
