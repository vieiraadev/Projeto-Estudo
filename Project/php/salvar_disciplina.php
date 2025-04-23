<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

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
$nome = $_POST['nome_disciplina'] ?? '';
$descricao = $_POST['descricao_disciplina'] ?? '';

if (empty($nome)) {
    http_response_code(400);
    echo json_encode(["erro" => "Nome da disciplina é obrigatório."]);
    exit;
}

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
