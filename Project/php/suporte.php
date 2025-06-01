<?php
session_start();

require_once 'conexao.php'; // Arquivo com a conexão $conexao

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $duvida = $_POST['duvida'] ?? '';
    $id_aluno = $_SESSION['id_aluno'] ?? null; 

    if (!empty($duvida) && $id_aluno !== null) {
        $stmt = $conexao->prepare("INSERT INTO suporte (mensagem, fk_id_aluno) VALUES (?, ?)");
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

$conexao->close();
