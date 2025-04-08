<?php

session_start();

// ver se deu certo o comando
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = "localhost:3306";
$usuario = "root"; // Usuário do MySQL
$senha = ""; // Senha do MySQL
$database = "estudomais";

// Conexão com o banco de dados
$conexao = new mysqli($host, $usuario, $senha, $database);

// Verifica a conexão
if ($conexao->connect_error) {
    die("Falha na conexão: " . $conexao->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email_aluno = trim($_POST['email']);
    $senha_digitada = $_POST['senha_aluno'];

    // Busca o aluno pelo email
    $stmt = $conexao->prepare("SELECT id_aluno, nome_aluno, senha_aluno FROM aluno WHERE email = ?");
    if (!$stmt) {
        die("Erro ao preparar a consulta: " . $conexao->error);
    }
    $stmt->bind_param("s", $email_aluno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $aluno = $resultado->fetch_assoc();

        // Verifica a senha
        if (password_verify($senha_digitada, $aluno['senha_aluno'])) {
            // Login bem-sucedido, cria sessão
            $_SESSION['id_aluno'] = $aluno['id_aluno'];
            $_SESSION['nome_aluno'] = $aluno['nome_aluno'];

            // Redireciona para a página logada
            header("Location: /Projeto-Planner/Project/html/home.html");
            exit();
        } else {
            echo "Senha incorreta.";
        }
    } else {
        echo "E-mail não encontrado.";
    }

    $stmt->close();
}

$conexao->close();
?>