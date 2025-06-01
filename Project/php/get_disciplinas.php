<?php
session_start();
require_once 'conexao.php';

$idAluno = $_SESSION['id_aluno'] ?? null;
if (!$idAluno) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id_disciplina, nome_disciplina FROM disciplina WHERE id_aluno = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $idAluno);
$stmt->execute();
$result = $stmt->get_result();

$disciplinas = [];
while ($row = $result->fetch_assoc()) {
    $disciplinas[] = $row;
}

echo json_encode($disciplinas);
?>
