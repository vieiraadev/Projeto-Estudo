<?php
session_start(); // Inicia a sessão

require_once 'conexao.php'; // substitui a conexão manual

// Verifica se o ID do anunciante está na sessão
if (!isset($_SESSION['id_anunciante'])) {
    http_response_code(401); // Não autorizado
    echo json_encode(["erro" => "Usuário não está autenticado."]);
    exit;
}

// Obtém o ID do anunciante da sessão
$idAnunciante = $_SESSION['id_anunciante'];

// Verifica campos obrigatórios
$campos = ['titulo', 'site_empresa', 'categoria', 'duracao'];
foreach ($campos as $campo) {
    if (!isset($_POST[$campo])) {
        http_response_code(400);
        echo json_encode(["erro" => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

// Verifica se a imagem foi enviada corretamente
if (!isset($_FILES['imagem_anuncio']) || $_FILES['imagem_anuncio']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["erro" => "Erro no upload da imagem."]);
    exit;
}

// Diretório onde as imagens serão salvas (usando caminho relativo)
$diretorioUpload = __DIR__ . "/uploads/";
if (!is_dir($diretorioUpload)) {
    mkdir($diretorioUpload, 0777, true);
}

// Gera nome único
$nomeOriginal = basename($_FILES['imagem_anuncio']['name']);
$extensao = pathinfo($nomeOriginal, PATHINFO_EXTENSION);
$nomeImagem = uniqid("img_", true) . "." . $extensao;
$caminhoImagem = $diretorioUpload . $nomeImagem;

// Move o arquivo
if (!move_uploaded_file($_FILES['imagem_anuncio']['tmp_name'], $caminhoImagem)) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha ao mover o arquivo para o destino."]);
    exit;
}

$titulo = $_POST['titulo'];
$imagem = $caminhoImagem;
$site = $_POST['site_empresa'];
$categoria = $_POST['categoria'];
$duracao = $_POST['duracao'];
$dataCriacao = date("Y-m-d H:i:s");

$sql = "INSERT INTO anuncio (titulo, imagem_anuncio, site_empresa, categoria, duracao, situacao, data_de_criacao_anuncio, fk_id_anunciante)
        VALUES (?, ?, ?, ?, ?, 'pendente', ?, ?)";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ssssisi", $titulo, $imagem, $site, $categoria, $duracao, $dataCriacao, $idAnunciante);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Anúncio cadastrado com sucesso!"]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir no banco: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
