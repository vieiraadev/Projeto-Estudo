<?php
header("Content-Type: application/json");
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

require_once 'conexao.php'; // substitui a conexão manual

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id_anuncio'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do anúncio não fornecido']);
    exit;
}

$stmt = $conexao->prepare("UPDATE anuncio SET situacao = 'aprovado' WHERE id_anuncio = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao atualizar anúncio']);
}

$stmt->close();
$conexao->close();
?>
