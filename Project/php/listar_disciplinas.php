<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

$sql = "SELECT id_disciplina, nome_disciplina, descricao_disciplina, nota FROM disciplina WHERE id_aluno = ?";
$stmt = $conexao->prepare($sql);

$stmt->bind_param("i", $id_aluno);

if ($stmt->execute()) {
    $result = $stmt->get_result();
    $disciplinas = [];

    while ($row = $result->fetch_assoc()) {
        $disciplinas[] = $row;
    }

    echo json_encode(["sucesso" => true, "disciplinas" => $disciplinas]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao buscar disciplinas: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
