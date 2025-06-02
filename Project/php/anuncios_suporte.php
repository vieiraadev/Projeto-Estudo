<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php'; 

$sql = "SELECT titulo, site_empresa, categoria, duracao, imagem_anuncio, id_anuncio FROM anuncio WHERE situacao = 'pendente'";
$result = $conexao->query($sql);

$anuncios = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $nomeImagem = basename($row['imagem_anuncio']);
        $row['imagem'] = "/Projeto-Planner/Project/php/uploads/" . $nomeImagem;
        $anuncios[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($anuncios);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro na consulta: ' . $conexao->error]);
}

$conexao->close();
?>
