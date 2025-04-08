<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json'); // Garante que o retorno seja JSON

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$host = "localhost:3306";
$usuario = "root";
$senha = "";
$database = "estudomais";

$conexao = new mysqli($host, $usuario, $senha, $database);

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

// Verifica se os campos esperados existem
if (
    !isset($_POST['nome_tarefa']) || !isset($_POST['descricao']) ||
    !isset($_POST['prioridade']) || !isset($_POST['data_validade']) || !isset($_POST['hora_validade'])
) {
    http_response_code(400);
    echo json_encode(["erro" => "Campos obrigatórios ausentes."]);
    exit;
}

$nome = $_POST['nome_tarefa'];
$desc = $_POST['descricao'];
$prioridade = $_POST['prioridade'];
$data = $_POST['data_validade'];
$hora = $_POST['hora_validade'];

$data_validade_completa = $data . ' ' . $hora . ':00';

$sql = "INSERT INTO tarefa_segunda (nome_tarefa, descricao, prioridade, data_validade, data_criacao_tarefa, fk_id_aluno)
        VALUES (?, ?, ?, ?, NOW(), ?)";

$stmt = $conexao->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ssssi", $nome, $desc, $prioridade, $data_validade_completa, $id_aluno);

if ($stmt->execute()) {
    echo json_encode([
        "sucesso" => true,
        "nome_tarefa" => $nome,
        "prioridade" => strtolower($prioridade),
        "hora" => $hora
    ]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
