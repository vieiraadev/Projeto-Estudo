<?php
session_start();

if (!isset($_SESSION['id_anunciante'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não autenticado.']);
    exit;
}

$idAnunciante = intval($_SESSION['id_anunciante']);

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

$sql = "SELECT nome_empresa, email_empresa, documento FROM anunciante WHERE id_anunciante = ?";
$stmt = $conexao->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na preparação da consulta: " . $conexao->error]);
    exit;
}

$stmt->bind_param("i", $idAnunciante);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $dados = $result->fetch_assoc();
    echo json_encode([
        'nome' => $dados['nome_empresa'],
        'email' => $dados['email_empresa'],
        'documento' => $dados['documento']
    ]);
} else {
    http_response_code(404);
    echo json_encode(['erro' => 'Usuário não encontrado.']);
}

$stmt->close();
$conexao->close();
?>
