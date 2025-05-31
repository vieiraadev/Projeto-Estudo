<?php
session_start(); 

$host = "localhost:3306";
$user = "root";
$pass = "";
$db = "estudomais";
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $duvida = $_POST['duvida'] ?? '';
    $id_aluno = $_SESSION['id_aluno'] ?? null; 

    if (!empty($duvida) && $id_aluno !== null) {
        $stmt = $conn->prepare("INSERT INTO suporte (mensagem, fk_id_aluno) VALUES (?, ?)");
        $stmt->bind_param("si", $duvida, $id_aluno);

        if ($stmt->execute()) {
            echo "Sua dúvida foi enviada com sucesso!";
        } else {
            echo "Erro ao enviar a dúvida.";
        }

        $stmt->close();
    } else {
        echo "Digite uma dúvida antes de enviar.";
    }
}

$conn->close();
?>
