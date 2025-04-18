<?php
$host = "localhost:3306";
$usuario = "root";
$senha = "";
$database = "estudomais";

$conexao = new mysqli($host, $usuario, $senha, $database);

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

// Verifica campos obrigatórios (exceto imagem que vai por $_FILES)
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

// Diretório onde as imagens serão salvas
$diretorioUpload = "uploads/";
if (!is_dir($diretorioUpload)) {
    mkdir($diretorioUpload, 0777, true); // Cria a pasta se não existir
}

// Gera nome único para evitar conflitos
$nomeOriginal = basename($_FILES['imagem_anuncio']['name']);
$extensao = pathinfo($nomeOriginal, PATHINFO_EXTENSION);
$nomeImagem = uniqid("img_", true) . "." . $extensao;
$caminhoImagem = $diretorioUpload . $nomeImagem;

// Move o arquivo para o diretório
if (!move_uploaded_file($_FILES['imagem_anuncio']['tmp_name'], $caminhoImagem)) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha ao mover o arquivo para o destino."]);
    exit;
}

// Dados do formulário
$titulo = $_POST['titulo'];
$imagem = $caminhoImagem; // Caminho da imagem salva
$site = $_POST['site_empresa'];
$categoria = $_POST['categoria'];
$duracao = $_POST['duracao'];

// Insere no banco de dados
$sql = "INSERT INTO anuncio (titulo, imagem_anuncio, site_empresa, categoria, duracao, data_cricacao_anuncio)
        VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ssssi", $titulo, $imagem, $site, $categoria, $duracao);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Anúncio cadastrado com sucesso!"]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir no banco: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
