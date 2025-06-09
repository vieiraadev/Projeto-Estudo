<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once 'conexao.php'; // conexão reutilizável

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

// Lê os dados enviados via fetch (JSON)
$data = json_decode(file_get_contents('php://input'), true);

// Validação básica
if (!isset($data['id_anuncio']) || !isset($data['comentario'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos.']);
    exit;
}

$id_anuncio = intval($data['id_anuncio']);
$comentario = trim($data['comentario']);

// Atualiza o status do anúncio para 'recusado' e salva o comentário
$stmt = $conexao->prepare("UPDATE anuncio SET situacao = 'recusado', comentario_recusa = ? WHERE id_anuncio = ?");
$stmt->bind_param('si', $comentario, $id_anuncio);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Anúncio recusado com sucesso.']);
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar o anúncio.']);
}

$stmt->close();
$conexao->close();
