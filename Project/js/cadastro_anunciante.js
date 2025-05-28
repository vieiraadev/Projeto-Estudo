document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const senha = document.getElementById("password").value.trim();
    const confirmar = document.getElementById("confirm-password").value.trim();
    const documento = document.getElementById("documento").value.replace(/[^\d]+/g, '');
    const nome = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
  
    let erros = [];
  
    if (nome.length < 3 || nome.length > 100) {
        erros.push("O nome da empresa deve ter entre 3 e 100 caracteres.");
    }
  
    if (email.length > 150) {
        erros.push("O e-mail não pode ter mais que 150 caracteres.");
    }
  
    if (documento.length === 11 && !validarCPF(documento)) {
        erros.push("CPF inválido! Por favor, digite um CPF válido.");
    } else if (documento.length === 14 && !validarCNPJ(documento)) {
        erros.push("CNPJ inválido! Por favor, digite um CNPJ válido.");
    } else if (documento.length !== 11 && documento.length !== 14) {
        erros.push("CPF ou CNPJ deve conter 11 ou 14 dígitos numéricos.");
    }
  
    if (senha.length < 6 || senha.length > 50) {
        erros.push("A senha deve ter entre 6 e 50 caracteres.");
    }
  
    if (senha !== confirmar) {
        erros.push("As senhas não coincidem.");
    }
  
    if (erros.length > 0) {
        // Exibe erros via SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Erro no cadastro',
            html: erros.join("<br>"),
        });
        return;
    }
  
    // Dados para enviar via POST
    const formData = new FormData();
    formData.append('nome_empresa', nome);
    formData.append('email_empresa', email);
    formData.append('documento', documento);
    formData.append('senha', senha);
    formData.append('confirmar_senha', confirmar);
  
    fetch('/Projeto-Planner/Project/php/cadastro_anunciante.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado com sucesso!',
                confirmButtonText: 'Ir para o login',
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.href = '/Projeto-Planner/Project/html/login_anunciante.html';
                }
              });
        } else {
            // Mostra os erros do servidor via Swal
            Swal.fire({
                icon: 'error',
                title: 'Erro no cadastro',
                html: (data.erros || []).join('<br>') || 'Ocorreu um erro desconhecido.'
            });
        }
    })
    .catch(err => {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.'
        });
        console.error(err);
    });
  });
  
  function validarCPF(cpf) {
    if (/^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
  
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    return resto === parseInt(cpf.charAt(10));
  }
  
  function validarCNPJ(cnpj) {
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let t = cnpj.length - 2,
        d = cnpj.substring(t),
        d1 = parseInt(d.charAt(0)),
        d2 = parseInt(d.charAt(1)),
        calc = x => {
            let n = cnpj.substring(0, x),
                y = x - 7,
                s = 0,
                r = 0;
  
            for (let i = x; i >= 1; i--) {
                s += n.charAt(x - i) * y--;
                if (y < 2) y = 9;
            }
  
            r = 11 - (s % 11);
            return r > 9 ? 0 : r;
        };
  
    return calc(t) === d1 && calc(t + 1) === d2;
  }
  