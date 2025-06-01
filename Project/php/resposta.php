<?php
require_once 'conexao.php'; // Conexão como $conexao

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$apiKey = trim(file_get_contents(__DIR__ . '/apikey.txt'));
$endpoint = 'https://api.cloud.llamaindex.ai/api/v1/pipelines/af110ca4-d9a1-466c-bd74-27dbf6a4cfb4/chat';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mensagem = $_POST['mensagem'] ?? '';

if (empty($mensagem)) {
    echo json_encode(["erro" => "Mensagem vazia."]);
    exit;
}

// Configuração da API Hugging Face
$api_key = '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';
$model = 'tiiuae/falcon-7b-instruct';

$prompt = "Crie um plano de estudos semanal organizado por dias da semana para o seguinte pedido:\n" . $mensagem;

$ch = curl_init("https://api-inference.huggingface.co/models/$model");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $api_key",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['inputs' => $prompt]));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Verifica se o retorno é JSON válido
$resultado = json_decode($response, true);

if (json_last_error() === JSON_ERROR_NONE) {
    echo json_encode($resultado);
} else {
    echo json_encode(["erro" => "Resposta da IA inválida", "raw" => $response]);
}
