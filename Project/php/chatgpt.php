<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Método não permitido',
        'allowed_methods' => 'POST',
        'received_method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Content-Type deve ser application/json']);
    exit;
}

// Obter dados da requisição
$jsonInput = file_get_contents('php://input');
if (empty($jsonInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum dado JSON recebido']);
    exit;
}

// Decodificar JSON
$input = json_decode($jsonInput, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido', 'details' => json_last_error_msg()]);
    exit;
}

// Validação dos dados
if (empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'O campo "message" é obrigatório']);
    exit;
}



// Preparar mensagens para a OpenAI
$messages = [
    ['role' => 'system', 'content' => $input['context'] ?? 'Você é um assistente útil. Responda em português brasileiro.'],
    ['role' => 'user', 'content' => $input['message']]
];

// Dados para envio
$postData = [
    'model' => 'gpt-3.5-turbo',
    'messages' => $messages,
    'temperature' => 0.7,
    'max_tokens' => 1000
];

// Configurar cURL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($postData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

// Executar requisição
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Tratar erros de conexão
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão', 'details' => $error]);
    exit;
}

// Decodificar resposta
$responseData = json_decode($response, true);

// Tratar erros da API OpenAI
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'Erro na API OpenAI',
        'code' => $httpCode,
        'details' => $responseData['error']['message'] ?? 'Erro desconhecido'
    ]);
    exit;
}

// Resposta de sucesso
echo json_encode([
    'reply' => $responseData['choices'][0]['message']['content'],
    'tokens_used' => $responseData['usage']['total_tokens'] ?? null
]);
?>