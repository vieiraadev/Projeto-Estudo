<?php
session_start();

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não autenticado.']);
    exit;
}

$idAluno = $_SESSION['id_aluno'];

require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

$sql = "SELECT nome_aluno, email FROM aluno WHERE id_aluno = ?";
$stmt = $conexao->prepare($sql); 
$stmt->bind_param("i", $idAluno);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $dados = $result->fetch_assoc();
    echo json_encode([
        'nome' => $dados['nome_aluno'],
        'email' => $dados['email']
    ]);
} else {
    http_response_code(404);
    echo json_encode(['erro' => 'Usuário não encontrado']);
}

$stmt->close();
$conexao->close(); 
?>
