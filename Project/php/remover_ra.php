<?php
require_once 'conexao.php'; // Conexão centralizada

$id_ra = $_POST['id_ra'] ?? null;

if (!$id_ra) {
    echo "ID do RA não fornecido.";
    exit;
}

// Remove as provas e trabalhos relacionados
$conexao->query("DELETE FROM prova WHERE fk_id_ra = $id_ra");
$conexao->query("DELETE FROM trabalho WHERE fk_id_ra = $id_ra");

// Depois remove o RA
if ($conexao->query("DELETE FROM ra WHERE id_ra = $id_ra") === TRUE) {
    echo "RA removido com sucesso!";
} else {
    echo "Erro ao remover RA: " . $conexao->error;
}

$conexao->close();
