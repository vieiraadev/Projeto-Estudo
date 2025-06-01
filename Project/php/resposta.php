<?php
header('Content-Type: application/json');

// Lê a chave da API de um arquivo ignorado pelo git (coloque sua chave em apikey.txt na mesma pasta)
$apiKey = trim(file_get_contents(__DIR__ . '/apikey.txt'));
$endpoint = 'https://api.cloud.llamaindex.ai/api/v1/pipelines/af110ca4-d9a1-466c-bd74-27dbf6a4cfb4/chat';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mensagem = $_POST['mensagem'] ?? '';

    $payload = json_encode([
        "messages" => [
            ["role" => "user", "content" => $mensagem]
        ]
    ]);

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $apiKey"
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {

        // 1. Extrai frases do tipo 0:"..."
        preg_match_all('/0:"(.*?)"/', $response, $matches);
        $respostaFinal = trim(implode('', $matches[1]));

        // 2. Remove barras invertidas extras
        $respostaFinal = str_replace('\\', '', $respostaFinal);

        // 3. Remove citações tipo [citation:...]
        $respostaFinal = preg_replace('/\s*\[citation:[^\]]+\]/', '', $respostaFinal);

        // 4. Corrige acentuação (\u00e1 etc)
        // Converte qualquer u00e1, u00e9... em entidades HTML
        $respostaFinal = preg_replace('/u([0-9a-fA-F]{4})/', '&#x$1;', $respostaFinal);
        // Decodifica entidades HTML para caracteres reais (á, é, ç, etc)
        $respostaFinal = html_entity_decode($respostaFinal, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // 5. Fallback se não extraiu nada
        if (!$respostaFinal) {
            $respostaFinal = "❓ Não foi possível extrair a resposta. Veja o retorno bruto: " . substr($response, 0, 500) . '...';
        }

        echo json_encode(['resposta' => $respostaFinal]);
    } else {
        echo json_encode([
            'erro' => "Erro na API LlamaCloud (HTTP $httpCode)",
            'resposta' => $response
        ]);
    }
}
