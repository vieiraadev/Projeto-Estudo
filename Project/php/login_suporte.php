<?php
session_start();

// Conexão com o banco
$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "estudomais";

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

// Receber dados do formulário
$email = $_POST['email'] ?? '';
$senha = $_POST['senha_aluno'] ?? '';

// Consulta segura
$sql = "SELECT * FROM suporte_login WHERE email = ? AND senha = SHA2(?, 256)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $senha);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $_SESSION['suporte_logado'] = true;
    echo json_encode(["status" => "sucesso"]);
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Credenciais inválidas"]);
}

$conn->close();
?>
