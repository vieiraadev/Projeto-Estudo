<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'conexao.php'; // substitui a conexão direta

if ($conexao->connect_error) {
    die(json_encode(['erro' => 'Falha na conexão: ' . $conexao->connect_error]));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email_aluno = trim($_POST['email']);
    $senha_digitada = $_POST['senha_aluno'];

    // Busca o aluno pelo email
    $stmt = $conexao->prepare("SELECT id_aluno, nome_aluno, senha_aluno FROM aluno WHERE email = ?");
    if (!$stmt) {
        die(json_encode(['erro' => 'Erro ao preparar a consulta: ' . $conexao->error]));
    }
    $stmt->bind_param("s", $email_aluno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 1) {
        $aluno = $resultado->fetch_assoc();

        // Verifica a senha
        if (password_verify($senha_digitada, $aluno['senha_aluno'])) {
            $_SESSION['id_aluno'] = $aluno['id_aluno'];
            $_SESSION['nome_aluno'] = $aluno['nome_aluno'];
            echo json_encode(['sucesso' => 'Login bem-sucedido']);
            exit();
        } else {
            echo json_encode(['erro' => 'Email e/ou senha incorretos.']);
            exit();
        }
    } else {
        echo json_encode(['erro' => 'Email e/ou senha incorretos.']);
        exit();
    }

    $stmt->close();
}

$conexao->close();
?>
