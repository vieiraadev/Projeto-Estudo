<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $host = "localhost:3306";
    $usuario = "root";
    $senha = "";
    $database = "estudomais";

    $conn = new mysqli($host, $usuario, $senha, $database);

    if ($conn->connect_error) {
        die("Erro de conexão: " . $conn->connect_error);
    }

    $nome = $_POST['nome_empresa'];
    $email = $_POST['email_empresa'];
    $documento = $_POST['documento'];
    $senha_hash = password_hash($_POST['senha'], PASSWORD_DEFAULT);
    $data_criacao = date('Y-m-d H:i:s');

    $sql = "INSERT INTO anunciante (nome_empresa, email_empresa, documento, senha, data_de_criacao_anunciante)
            VALUES (?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $nome, $email, $documento, $senha_hash, $data_criacao);

    if ($stmt->execute()) {
        header("Location: /Projeto-Planner/Project/html/login_anunciante.html");
        exit;
    } else {
        echo "Erro ao cadastrar: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Método inválido.";
}
