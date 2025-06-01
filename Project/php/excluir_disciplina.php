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
    // Desativa modo de exceção automática temporariamente se quiser tratar manual
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $stmt = $conexao->prepare("DELETE FROM disciplina WHERE id_disciplina = ? AND id_aluno = ?");
    $stmt->bind_param("ii", $id_disciplina, $id_aluno);
    $stmt->execute();

    echo json_encode(["status" => "sucesso"]);
    $stmt->close();
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
