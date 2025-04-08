<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['nome_aluno'])) {
    $nome_completo = $_SESSION['nome_aluno'];
    $primeiro_nome = explode(' ', $nome_completo)[0]; // ← isso pega só o primeiro nome

    echo json_encode(["nome" => $primeiro_nome]);
} else {
    echo json_encode(["erro" => "Sessão não iniciada ou nome_aluno não definido"]);
}
?>
