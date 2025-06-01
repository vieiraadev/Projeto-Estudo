<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro na conexão: ' . $conexao->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id_anuncio'] ?? null;
    $titulo = $_POST['titulo'] ?? '';
    $site_empresa = $_POST['site_empresa'] ?? '';
    $categoria = $_POST['categoria'] ?? '';
    $duracao = $_POST['duracao'] ?? 0;
    $situacao = $_POST['situacao'] ?? '';

    if ($id) {
        $stmt = $conexao->prepare("UPDATE anuncio SET titulo = ?, site_empresa = ?, categoria = ?, duracao = ?, situacao = ? WHERE id_anuncio = ?");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro na preparação da query: ' . $conexao->error]);
            exit;
        }
        $stmt->bind_param("sssisi", $titulo, $site_empresa, $categoria, $duracao, $situacao, $id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro ao executar a query: ' . $stmt->error]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'ID inválido.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método inválido.']);
}
?>
