<?php
session_start();

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

// Receber dados do formulário
$email = $_POST['email'] ?? '';
$senha = $_POST['senha_aluno'] ?? '';

// Consulta segura
$sql = "SELECT * FROM suporte_login WHERE email = ? AND senha = SHA2(?, 256)";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ss", $email, $senha);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $_SESSION['suporte_logado'] = true;
    echo json_encode(["status" => "sucesso"]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Credenciais inválidas"]);
}

$conexao->close();
?>
