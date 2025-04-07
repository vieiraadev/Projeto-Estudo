<?php
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
// Verifica se o formulário foi submetido
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome_aluno = trim($_POST['nome_aluno']);
    $senha_aluno = $_POST['senha_aluno'];
    $email_aluno= trim($_POST['email']);

    // Verifica se o nome de usuário ou o email já existem
    $query = "SELECT nome_aluno, email FROM aluno WHERE nome_aluno = ? OR email = ?";
    $stmt = $conexao->prepare($query);
    if (!$stmt) {
        die("Erro ao preparar a consulta: " . $conexao->error);
    }


    $stmt->bind_param("ss", $nome_aluno, $email);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        // Verifica se o conflito é de nome de usuário ou email
        $linha = $resultado->fetch_assoc();
        if ($linha['nome_aluno'] === $usuario) {
            echo "Erro: O nome de usuário já está em uso.";
        } elseif ($linha['email'] === $email) {
            echo "Erro: O email já está em uso.";
        }
    } else {
        // Prepara e executa a inserção na tabela correspondente
        $stmt->close();

        $stmt = $conexao->prepare("INSERT INTO aluno (nome_aluno, senha_aluno, email) VALUES (?, ?, ?)");
        if (!$stmt) {
            die("Erro ao preparar a inserção: " . $conexao->error);
        }

        $senha_hash = password_hash($senha_aluno, PASSWORD_DEFAULT); // Hash da senha
        $stmt->bind_param("sss", $nome_aluno, $senha_hash, $email_aluno);

        if ($stmt->execute()) {
            // Redireciona para a página de login após cadastro
            header("Location: /Projeto-Planner/Project/html/login.html");
            exit(); // Certifica-se de que o script será encerrado
        } else {
            echo "Erro ao realizar o cadastro: " . $stmt->error;
        }
    }

    $stmt->close();
}

$conexao->close();

?>