<?php
$host = 'localhost:3306';
$db = 'estudomais';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$id_ra = $_POST['id_ra'] ?? null;

if (!$id_ra) {
    echo "ID do RA não fornecido.";
    exit;
}

// Remove as provas e trabalhos relacionados
$conn->query("DELETE FROM prova WHERE fk_id_ra = $id_ra");
$conn->query("DELETE FROM trabalho WHERE fk_id_ra = $id_ra");

// Depois remove o RA
if ($conn->query("DELETE FROM ra WHERE id_ra = $id_ra") === TRUE) {
    echo "RA removido com sucesso!";
} else {
    echo "Erro ao remover RA: " . $conn->error;
}

$conn->close();
?>
