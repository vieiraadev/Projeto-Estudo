<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Conexão com o banco
require_once 'conexao.php';

// Verifica se o usuário está autenticado
if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

// Captura dados do POST
$id_aluno = $_SESSION['id_aluno'];
$nome = $_POST['nome_disciplina'] ?? '';
$descricao = $_POST['descricao_disciplina'] ?? '';

if (empty($nome)) {
    http_response_code(400);
    echo json_encode(["erro" => "Nome da disciplina é obrigatório."]);
    exit;
}

// Limites de caracteres
$limites = [
    'nome_disciplina' => 100,
    'descricao' => 1000,
];

if (strlen($nome) > $limites['nome_disciplina']) {
    http_response_code(400);
    echo json_encode(["erro" => "O nome da disciplina é muito grande (máximo {$limites['nome_disciplina']} caracteres)."]);
    exit;
}

if (strlen($descricao) > $limites['descricao']) {
    http_response_code(400);
    echo json_encode(["erro" => "A descrição da disciplina é muito grande (máximo {$limites['descricao']} caracteres)."]);
    exit;
}

// Preparar e executar SQL
$sql = "INSERT INTO disciplina (nome_disciplina, descricao_disciplina, id_aluno) VALUES (?, ?, ?)";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("ssi", $nome, $descricao, $id_aluno);

if ($stmt->execute()) {
    $id = $conexao->insert_id;

    echo json_encode([
        "status" => "sucesso",
        "disciplina" => [
            "id_disciplina" => $id,
            "nome_disciplina" => $nome,
            "descricao_disciplina" => $descricao
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao salvar disciplina: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
