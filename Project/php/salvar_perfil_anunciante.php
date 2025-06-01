<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['id_anunciante'])) {
    echo json_encode(["erro" => "Acesso negado. Faça login primeiro."], JSON_UNESCAPED_UNICODE);
    exit;
}

$id_anunciante = $_SESSION['id_anunciante'];

// Conexão com o banco
require_once 'conexao.php';

// Captura os dados
$nome = $_POST['nome'] ?? '';
$email = $_POST['email'] ?? '';
$documento = $_POST['documento'] ?? '';
$senha = $_POST['senha'] ?? '';

$limites = [
    'nome_empresa' => 50,
    'email_empresa' => 50,
    'documento' => 14,
    'senha' => 255,
];

// Validações de tamanho
if (!empty($nome) && strlen($nome) > $limites['nome_empresa']) {
    echo json_encode(["erro" => "O nome da empresa é muito grande (máximo {$limites['nome_empresa']} caracteres)."], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!empty($email) && strlen($email) > $limites['email_empresa']) {
    echo json_encode(["erro" => "O email informado é muito grande (máximo {$limites['email_empresa']} caracteres)."], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!empty($documento) && strlen($documento) > $limites['documento']) {
    echo json_encode(["erro" => "O documento informado é muito grande (máximo {$limites['documento']} caracteres)."], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!empty($senha) && strlen($senha) > $limites['senha']) {
    echo json_encode(["erro" => "A senha informada é muito grande (máximo {$limites['senha']} caracteres)."], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificação se o documento já existe
if (!empty($documento)) {
    $stmt_check = $conexao->prepare("SELECT id_anunciante FROM anunciante WHERE documento = ? AND id_anunciante != ?");
    if (!$stmt_check) {
        echo json_encode(["erro" => "Erro ao preparar a verificação de documento: " . $conexao->error], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $stmt_check->bind_param("si", $documento, $id_anunciante);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        echo json_encode(["erro" => "O CPF/CNPJ informado já está cadastrado."], JSON_UNESCAPED_UNICODE);
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();
}

$campos = [];
$valores = [];

if (!empty($nome)) {
    $campos[] = "nome_empresa = ?";
    $valores[] = $nome;
}
if (!empty($email)) {
    $campos[] = "email_empresa = ?";
    $valores[] = $email;
}
if (!empty($documento)) {
    $campos[] = "documento = ?";
    $valores[] = $documento;
}
if (!empty($senha)) {
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $campos[] = "senha = ?";
    $valores[] = $senhaHash;
}

if (empty($campos)) {
    echo json_encode(["erro" => "Nenhum dado enviado para atualizar."], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "UPDATE anunciante SET " . implode(", ", $campos) . " WHERE id_anunciante = ?";
$stmt = $conexao->prepare($sql);

if (!$stmt) {
    echo json_encode(["erro" => "Erro na preparação da consulta: " . $conexao->error], JSON_UNESCAPED_UNICODE);
    exit;
}

$tipos = str_repeat("s", count($valores)) . "i";
$valores[] = $id_anunciante;
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => "Perfil atualizado com sucesso!"], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["erro" => "Erro ao atualizar o perfil: " . $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conexao->close();
