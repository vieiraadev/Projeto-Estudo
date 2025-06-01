<?php
require_once 'conexao.php'; // Substitui a conexão manual

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

$hoje = date('Y-m-d H:i:s');

$sql = "SELECT * FROM anuncio 
        WHERE situacao = 'aprovado'
        AND DATE_ADD(data_de_criacao_anuncio, INTERVAL duracao DAY) > '$hoje'";

$result = mysqli_query($conexao, $sql);

while ($anuncio = mysqli_fetch_assoc($result)) {
    $caminhoCompleto = $anuncio['imagem_anuncio'];
    $imagem = basename($caminhoCompleto); // ⬅️ Pega só "img_xxx.png"

    $titulo = htmlspecialchars($anuncio['titulo']);
    $link = htmlspecialchars($anuncio['site_empresa']);

    if (!preg_match('/^https?:\/\//', $link)) {
        $link = 'https://' . $link;
    }

    echo "<a href='$link' target='_blank' class='carousel-item'>
            <img src='/projeto-Planner/Project/php/uploads/$imagem' alt='$titulo'>
          </a>";
}
?>
