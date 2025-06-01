<?php
require_once 'conexao.php'; // substitui a conexão manual

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

$sql = "SELECT * FROM anuncio";
$result = mysqli_query($conexao, $sql);

if (!$result) {
    die("Erro na consulta SQL: " . mysqli_error($conexao));
}

$anuncios = [];

if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Extrai só o nome da imagem
        $nomeImagem = basename($row['imagem_anuncio']);

        // Caminho acessível ao navegador
        $urlImagem = "/Projeto-Planner/Project/php/uploads/" . $nomeImagem;

        $anuncios[] = [
            'titulo' => htmlspecialchars($row['titulo']),
            'site_empresa' => htmlspecialchars($row['site_empresa']),
            'categoria' => htmlspecialchars($row['categoria']),
            'duracao' => (int) $row['duracao'],
            'situacao' => $row['situacao'],
            'comentario_recusa' => $row['comentario_recusa'],
            'imagem_anuncio' => htmlspecialchars($urlImagem),
            'id_anuncio' => (int) $row['id_anuncio']
        ];
    }
}

echo json_encode($anuncios);
?>
