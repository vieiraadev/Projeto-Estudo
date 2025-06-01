<?php
session_start();

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode([]);
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$id_disciplina = $_GET['id_disciplina'] ?? null;

if (!$id_disciplina) {
    http_response_code(400);
    echo json_encode(["erro" => "Disciplina não especificada."]);
    exit;
}

$ras = [];

$stmtRA = $conexao->prepare("SELECT id_ra, nome_ra, peso_ra FROM ra WHERE fk_id_aluno = ? AND fk_id_disciplina = ? ORDER BY id_ra DESC");
$stmtRA->bind_param("ii", $id_aluno, $id_disciplina);
$stmtRA->execute();
$resRA = $stmtRA->get_result();

while ($ra = $resRA->fetch_assoc()) {
    $id_ra = $ra['id_ra'];

    $resProvas = $conexao->query("SELECT nome_prova, nota, peso FROM prova WHERE fk_id_ra = $id_ra");
    $provas = [];
    while ($p = $resProvas->fetch_assoc()) {
        $provas[] = $p;
    }

    $resTrabalhos = $conexao->query("SELECT nome_trabalho, nota, peso FROM trabalho WHERE fk_id_ra = $id_ra");
    $trabalhos = [];
    while ($t = $resTrabalhos->fetch_assoc()) {
        $trabalhos[] = $t;
    }

    $ra['provas'] = $provas;
    $ra['trabalhos'] = $trabalhos;

    $ras[] = $ra;
}

header("Content-Type: application/json");
echo json_encode($ras);
$conexao->close();
?>
