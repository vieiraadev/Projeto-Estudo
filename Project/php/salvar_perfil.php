<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Verifica se o usuário está logado
if (!isset($_SESSION['id_aluno'])) {
    die("Acesso negado. Faça login primeiro.");
}

$id_aluno = $_SESSION['id_aluno'];

// Conexão com o banco
$host = "localhost:3306";
$usuario = "root";
$senha = "";
$database = "estudomais";

$conexao = new mysqli($host, $usuario, $senha, $database);

// Verificação da conexão
if ($conexao->connect_error) {
    die("Erro na conexão: " . $conexao->connect_error);
}

// Pegando os dados do formulário
$nome = $_POST['nome'] ?? '';
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

// Validação simples
if (empty($nome) || empty($email)) {
    die("Nome e email são obrigatórios.");
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
    echo "Perfil atualizado com sucesso!";
} else {
    echo "Erro ao atualizar o perfil: " . $stmt->error;
}

// Fecha a conexão
$stmt->close();
$conexao->close();
?>
