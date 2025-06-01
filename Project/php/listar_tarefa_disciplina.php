<?php
header('Content-Type: application/json');
session_start();

require_once 'conexao.php';

if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

if (!isset($_GET['id_disciplina'])) {
    echo json_encode(["erro" => "ID da disciplina não fornecido."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$id_disciplina = intval($_GET['id_disciplina']);

// Consulta tarefas da disciplina para o aluno
$sql = "SELECT id_tarefa, nome_tarefa, dia_da_semana 
        FROM tarefa 
        WHERE fk_id_aluno = ? AND fk_id_disciplina = ?
        ORDER BY dia_da_semana, hora_validade";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    echo json_encode(["erro" => "Erro na preparação da consulta: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ii", $id_aluno, $id_disciplina);
$stmt->execute();
$result = $stmt->get_result();

$tarefas = [];
while ($row = $result->fetch_assoc()) {
    $tarefas[] = $row;
}

echo json_encode($tarefas);
$stmt->close();
$conexao->close();
?>
