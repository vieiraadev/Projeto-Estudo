<?php
header('Content-Type: application/json');
require_once 'conexao.php'; // Importa a conexão como $conexao

$id_suporte = $_POST['id_suporte'] ?? null;
$resposta = $_POST['resposta'] ?? null;

if (!$id_suporte || !$resposta) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos.']);
    exit;
}

$sql = "UPDATE suporte SET resposta = ? WHERE id = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("si", $resposta, $id_suporte);

if ($stmt->execute()) {
    echo json_encode(['status' => 'sucesso', 'mensagem' => 'Resposta enviada com sucesso.']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro ao enviar resposta.']);
}

$stmt->close();
$conexao->close();
