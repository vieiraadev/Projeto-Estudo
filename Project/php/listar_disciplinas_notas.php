<?php
session_start();

require_once 'conexao.php'; // substitui a conexão manual

header("Content-Type: application/json");

// Verifique se o ID do aluno está na sessão
if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["success" => false, "message" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

$sql = "SELECT id_disciplina, nome_disciplina, descricao_disciplina FROM disciplina WHERE id_aluno = ?";
$stmt = $conexao->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Erro na preparação da query: " . $conexao->error]);
    exit;
}

$stmt->bind_param("i", $id_aluno);
$stmt->execute();

$result = $stmt->get_result();

$disciplinas = [];
while ($row = $result->fetch_assoc()) {
    $disciplinas[] = $row;
}

echo json_encode(["success" => true, "disciplinas" => $disciplinas]);

$stmt->close();
$conexao->close();
?>
