<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: /Projeto-Planner/Project/html/login_anunciante.html");
    exit;
}

$host     = "localhost:3306";
$usuario  = "root";
$senha    = "";
$database = "estudomais";

$conn = new mysqli($host, $usuario, $senha, $database);
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$email    = trim($_POST['email_empresa']);
$senhaRaw = $_POST['senha'];

$sql  = "SELECT id_anunciante, nome_empresa, senha FROM anunciante WHERE email_empresa = ?";
$stmt = $conn->prepare($sql);
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
        header("Location: /Projeto-Planner/Project/html/anunciante.html");
        exit;
    }
}

$stmt->close();
$conn->close();

header("Location: /Projeto-Planner/Project/html/login_anunciante.html?error=1");
exit;
?>
