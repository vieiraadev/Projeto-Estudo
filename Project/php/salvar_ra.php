<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

require_once 'conexao.php';

if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["success" => false, "message" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$raNome = $_POST['ra_nome'];
$raPeso = $_POST['ra_peso'];
$id_disciplina = $_POST['id_disciplina'] ?? null;

if (!$raNome || !$raPeso || !$id_disciplina) {
    echo json_encode(["success" => false, "message" => "Dados incompletos."]);
    exit;
}

$stmt = $conexao->prepare("INSERT INTO ra (nome_ra, peso_ra, fk_id_aluno, fk_id_disciplina) VALUES (?, ?, ?, ?)");
$stmt->bind_param("siii", $raNome, $raPeso, $id_aluno, $id_disciplina);

if ($stmt->execute()) {
    $id_ra = $conexao->insert_id;
    echo json_encode([
        "success" => true,
        "message" => "RA salvo com sucesso!",
        "id_ra" => $id_ra,
        "id_aluno" => $id_aluno
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao salvar RA: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
