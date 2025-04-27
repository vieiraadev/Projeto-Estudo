// Função para atualizar as iniciais do nome
function atualizarIniciais(nomeCompleto) {
    console.log('Atualizando iniciais com o nome:', nomeCompleto);  // Log para verificar o nome recebido
    const partes = nomeCompleto.trim().split(" ").filter(Boolean);
    let iniciais = "";

    if (partes.length >= 2) {
        const primeiraInicial = partes[0].charAt(0).toUpperCase();
        const segundaInicial = partes.find((parte, index) => index > 0 && parte.length > 0)?.charAt(0).toUpperCase() || "";
        iniciais = primeiraInicial + segundaInicial;
    } else if (partes.length === 1) {
        iniciais = partes[0].charAt(0).toUpperCase();
    }

    const fotoTopo = document.getElementById("profile-initials");
    const fotoSidebar = document.getElementById("profile-initials-sidebar");

    if (fotoTopo) {
        fotoTopo.textContent = iniciais;
    } else {
        console.error("Elemento 'profile-initials' não encontrado na página.");
    }

    if (fotoSidebar) {
        fotoSidebar.textContent = iniciais;
    } else {
        console.error("Elemento 'profile-initials-sidebar' não encontrado na página.");
    }
}

// Função para buscar o nome do usuário do banco
function getNomeUsuario() {
    fetch('/Projeto-Planner/Project/php/buscardados_anunciante.php')  // Caminho para o seu PHP
        .then(response => response.json())
        .then(data => {
            console.log("Dados do usuário:", data);  // Log para verificar os dados recebidos
            if (data.nome) {
                atualizarIniciais(data.nome);
            } else {
                console.error("Erro ao buscar o nome:", data.erro);
            }
        })
        .catch(error => {
            console.error("Erro ao fazer a requisição:", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    // Chama a função para buscar o nome do banco e atualizar as iniciais
    getNomeUsuario();
});
