<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro na conexão: " . $conexao->connect_error]);
    ob_end_flush();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id_anuncio'] ?? null;

    if ($id) {
        $stmt = $conexao->prepare("DELETE FROM anuncio WHERE id_anuncio = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Erro ao excluir.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'ID inválido.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método inválido.']);
}

ob_end_flush();
?>
