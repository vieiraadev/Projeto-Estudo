<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$host = "localhost:3306";
$usuario = "root";
$senha = "";
$database = "estudomais";

$conexao = new mysqli($host, $usuario, $senha, $database);

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$id_disciplina = $_POST['id_disciplina'] ?? 0;

if ($id_disciplina <= 0) {
    http_response_code(400);
    echo json_encode(["erro" => "ID da disciplina não fornecido."]);
    exit;
}

$sql = "DELETE FROM disciplina WHERE id_disciplina = ? AND id_aluno = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ii", $id_disciplina, $id_aluno);

if ($stmt->execute()) {
    echo json_encode(["status" => "sucesso"]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao excluir disciplina: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
