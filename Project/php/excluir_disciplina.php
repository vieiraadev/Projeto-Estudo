<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php';

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

try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    // Busca todos os ids de RA vinculados à disciplina
    $idsRA = [];
    $stmtBuscaRA = $conexao->prepare("SELECT id_ra FROM ra WHERE fk_id_disciplina = ?");
    $stmtBuscaRA->bind_param("i", $id_disciplina);
    $stmtBuscaRA->execute();
    $resRA = $stmtBuscaRA->get_result();
    while ($row = $resRA->fetch_assoc()) {
        $idsRA[] = $row['id_ra'];
    }
    $stmtBuscaRA->close();

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

} catch (mysqli_sql_exception $e) {
    if (strpos($e->getMessage(), 'foreign key constraint fails') !== false) {
        http_response_code(400);
        echo json_encode(["erro" => "Não é possível excluir esta disciplina porque existem registros vinculados a ela."]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao excluir disciplina: " . $e->getMessage()]);
    }
}

$conexao->close();
?>
