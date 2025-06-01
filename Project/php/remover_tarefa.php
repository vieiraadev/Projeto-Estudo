<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php'; // Conexão centralizada

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

if (!isset($_POST['id_tarefa'])) {
    http_response_code(400);
    echo json_encode(["erro" => "ID da tarefa não fornecido."]);
    exit;
}

$id_tarefa = intval($_POST['id_tarefa']);

$sql = "DELETE FROM tarefa WHERE id_tarefa = ? AND fk_id_aluno = ?";
$stmt = $conexao->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ii", $id_tarefa, $id_aluno);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["erro" => "Tarefa não encontrada ou não pertence ao aluno."]);
    }
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao deletar: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
