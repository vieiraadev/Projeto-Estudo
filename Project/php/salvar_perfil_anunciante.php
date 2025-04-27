<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

if (!isset($_SESSION['id_anunciante'])) {
    die("Acesso negado. Faça login primeiro.");
}

$id_anunciante = $_SESSION['id_anunciante'];

$host = "localhost:3306";
$usuario = "root";
$senha_db = "";
$database = "estudomais";

$conexao = new mysqli($host, $usuario, $senha_db, $database);

if ($conexao->connect_error) {
    die("Erro na conexão: " . $conexao->connect_error);
}

$nome = $_POST['nome'] ?? null;
$email = $_POST['email'] ?? null;
$documento = $_POST['documento'] ?? null;
$senha = $_POST['senha'] ?? null;

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
    die("Nenhum dado enviado para atualizar.");
}

$sql = "UPDATE anunciante SET " . implode(", ", $campos) . " WHERE id_anunciante = ?";
$stmt = $conexao->prepare($sql);

$tipos = str_repeat("s", count($valores)) . "i"; // 's' para strings, 'i' para id
$valores[] = $id_anunciante;

$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo "Perfil atualizado com sucesso!";
} else {
    echo "Erro ao atualizar o perfil: " . $stmt->error;
}

$stmt->close();
$conexao->close();
?>
