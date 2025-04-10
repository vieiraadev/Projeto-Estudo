<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "estudomais";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$id_suporte = $_POST['id_suporte'] ?? null;
$resposta = $_POST['resposta'] ?? null;

if (!$id_suporte || !$resposta) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos.']);
    exit;
}

$sql = "INSERT INTO respostas (id_suporte, resposta) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $id_suporte, $resposta);

if ($stmt->execute()) {
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Resposta enviada com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao enviar resposta.']);
}

$stmt->close();
$conn->close();
