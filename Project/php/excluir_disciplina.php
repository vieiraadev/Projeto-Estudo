<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php'; // substitui a conexão manual

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

// Buscar todos os IDs da tabela RA para essa disciplina
$sqlBuscaRAs = "SELECT id_ra FROM ra WHERE fk_id_disciplina = ?";
$stmtBuscaRAs = $conexao->prepare($sqlBuscaRAs);
$stmtBuscaRAs->bind_param("i", $id_disciplina);
$stmtBuscaRAs->execute();
$result = $stmtBuscaRAs->get_result();

$idsRA = [];
while ($row = $result->fetch_assoc()) {
    $idsRA[] = $row['id_ra'];
}
$stmtBuscaRAs->close();

if (!empty($idsRA)) {
    $in = implode(',', array_fill(0, count($idsRA), '?'));
    $types = str_repeat('i', count($idsRA));

    // Excluir provas
    $stmtDeleteProvas = $conexao->prepare("DELETE FROM prova WHERE fk_id_ra IN ($in)");
    $stmtDeleteProvas->bind_param($types, ...$idsRA);
    if (!$stmtDeleteProvas->execute()) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao excluir provas: " . $stmtDeleteProvas->error]);
        $stmtDeleteProvas->close();
        $conexao->close();
        exit;
    }
    $stmtDeleteProvas->close();

    // Excluir atividades avaliativas
    $stmtDeleteAtividades = $conexao->prepare("DELETE FROM atividade_avaliativa WHERE fk_id_ra IN ($in)");
    $stmtDeleteAtividades->bind_param($types, ...$idsRA);
    if (!$stmtDeleteAtividades->execute()) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao excluir atividades avaliativas: " . $stmtDeleteAtividades->error]);
        $stmtDeleteAtividades->close();
        $conexao->close();
        exit;
    }
    $stmtDeleteAtividades->close();

    // Excluir trabalhos
    $stmtDeleteTrabalhos = $conexao->prepare("DELETE FROM trabalho WHERE fk_id_ra IN ($in)");
    $stmtDeleteTrabalhos->bind_param($types, ...$idsRA);
    if (!$stmtDeleteTrabalhos->execute()) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao excluir trabalhos: " . $stmtDeleteTrabalhos->error]);
        $stmtDeleteTrabalhos->close();
        $conexao->close();
        exit;
    }
    $stmtDeleteTrabalhos->close();
}

// Excluir registros da tabela RA
$stmtDeleteRA = $conexao->prepare("DELETE FROM ra WHERE fk_id_disciplina = ?");
$stmtDeleteRA->bind_param("i", $id_disciplina);
if (!$stmtDeleteRA->execute()) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao excluir RA: " . $stmtDeleteRA->error]);
    $stmtDeleteRA->close();
    $conexao->close();
    exit;
}
$stmtDeleteRA->close();

// Excluir a disciplina
$stmtDisciplina = $conexao->prepare("DELETE FROM disciplina WHERE id_disciplina = ? AND id_aluno = ?");
$stmtDisciplina->bind_param("ii", $id_disciplina, $id_aluno);
if ($stmtDisciplina->execute()) {
    echo json_encode(["status" => "sucesso"]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao excluir disciplina: " . $stmtDisciplina->error]);
}
$stmtDisciplina->close();
$conexao->close();
?>
