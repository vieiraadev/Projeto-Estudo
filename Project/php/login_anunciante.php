<?php
session_start();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['sucesso' => false, 'erro' => 'Método inválido.']);
    exit;
}

require_once 'conexao.php'; // substitui a conexão direta

if ($conexao->connect_error) {
    echo json_encode(['sucesso' => false, 'erro' => 'Erro de conexão com o banco de dados.']);
    exit;
}

$email    = trim($_POST['email_empresa']);
$senhaRaw = $_POST['senha'];

$sql  = "SELECT id_anunciante, nome_empresa, senha FROM anunciante WHERE email_empresa = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 1) {
    $stmt->bind_result($id, $nomeEmpresa, $senhaHash);
    $stmt->fetch();

    if (password_verify($senhaRaw, $senhaHash)) {
        $_SESSION['id_anunciante']    = $id;
        $_SESSION['anunciante_nome']  = $nomeEmpresa;
        $_SESSION['anunciante_email'] = $email;

        echo json_encode(['sucesso' => true]);
        exit;
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Senha incorreta.']);
        exit;
    }
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'E-mail não encontrado.']);
    exit;
}

$stmt->close();
$conexao->close();
