<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["erro" => "Acesso negado. Faça login primeiro."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

// Conexão com o banco
require_once 'conexao.php';

$nome  = $_POST['nome']  ?? '';
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

if (empty($nome) || empty($email)) {
    echo json_encode(["erro" => "Nome e email são obrigatórios."]);
    exit;
}

$limites = [
    'nome'  => 50,
    'email' => 50,
    'senha' => 255,
];

if (strlen($nome) > $limites['nome']) {
    echo json_encode(["erro" => "O nome de usuário é muito grande (máximo {$limites['nome']} caracteres)."]);
    exit; 
}
if (strlen($email) > $limites['email']) {
    echo json_encode(["erro" => "O email informado é muito grande (máximo {$limites['email']} caracteres)."]);
    exit;
}
if (strlen($senha) > $limites['senha']) {
    echo json_encode(["erro" => "A senha informada é muito grande (máximo {$limites['senha']} caracteres)."]);
    exit;
}

// Atualiza com ou sem alteração de senha
if (!empty($senha)) {
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $sql = "UPDATE aluno SET nome_aluno = ?, email = ?, senha_aluno = ? WHERE id_aluno = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("sssi", $nome, $email, $senhaHash, $id_aluno);
} else {
    $sql = "UPDATE aluno SET nome_aluno = ?, email = ? WHERE id_aluno = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("ssi", $nome, $email, $id_aluno);
}

if ($stmt->execute()) {
    echo json_encode(["sucesso" => "Perfil atualizado com sucesso!"]);
} else {
    echo json_encode(["erro" => "Erro ao atualizar perfil."]);
}

$stmt->close();
$conexao->close();
