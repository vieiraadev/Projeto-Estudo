<?php
session_start();

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não autenticado']);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

$mysqli = new mysqli("localhost", "root", "", "estudomais");

if ($mysqli->connect_error) {
    die("Erro na conexão: " . $mysqli->connect_error);
}

// Considera tanto id_aluno quanto fk_id_aluno
$sql = "SELECT id, mensagem, resposta, data_envio 
        FROM suporte 
        WHERE resposta IS NOT NULL 
        AND (id_aluno = ? OR fk_id_aluno = ?) 
        ORDER BY data_envio DESC 
        LIMIT 10";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("ii", $id_aluno, $id_aluno);
$stmt->execute();
$result = $stmt->get_result();

$respostas = [];

while ($row = $result->fetch_assoc()) {
    $respostas[] = $row;
}

header('Content-Type: application/json');
echo json_encode($respostas);
?>
