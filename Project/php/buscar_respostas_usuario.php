<?php
session_start();

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao conectar ao banco"]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'] ?? null;

if (!$id_aluno) {
    http_response_code(401);
    echo json_encode(["erro" => "Usuário não autenticado"]);
    exit;
}

$sql = "SELECT mensagem, resposta, data_envio FROM suporte WHERE fk_id_aluno = ? AND resposta IS NOT NULL ORDER BY data_envio DESC";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id_aluno);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

echo json_encode($dados);
?>
