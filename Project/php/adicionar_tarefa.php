<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

$campos = ['nome_tarefa', 'descricao', 'prioridade', 'hora_validade', 'dia'];
foreach ($campos as $campo) {
    if (!isset($_POST[$campo])) {
        http_response_code(400);
        echo json_encode(["erro" => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$nome = $_POST['nome_tarefa'];
$desc = $_POST['descricao'];
$prioridade = $_POST['prioridade'];
$hora = $_POST['hora_validade'];
$dia = strtolower($_POST['dia']);

// Valida o dia
$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
if (!in_array($dia, $diasPermitidos)) {
    http_response_code(400);
    echo json_encode(["erro" => "Dia da semana inválido."]);
    exit;
}

// Limites de tamanho
$limites = [
    'nome_tarefa' => 50,
    'descricao' => 300,
];

if (strlen($nome) > $limites['nome_tarefa']) {
    http_response_code(400);
    echo json_encode(["erro" => "O nome da tarefa é muito grande (máximo {$limites['nome_tarefa']} caracteres)."]);
    exit;
}

if (strlen($desc) > $limites['descricao']) {
    http_response_code(400);
    echo json_encode(["erro" => "A descrição da tarefa é muito grande (máximo {$limites['descricao']} caracteres)."]);
    exit;
}

// Query usando tabela única 'tarefa'
$sql = "INSERT INTO tarefa (nome_tarefa, descricao, prioridade, hora_validade, data_criacao_tarefa, dia_da_semana, fk_id_aluno)
        VALUES (?, ?, ?, ?, NOW(), ?, ?)";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("sssssi", $nome, $desc, $prioridade, $hora, $dia, $id_aluno);

if ($stmt->execute()) {
    echo json_encode([
        "sucesso" => true,
        "id_tarefa" => $stmt->insert_id,
        "nome_tarefa" => $nome,
        "prioridade" => strtolower($prioridade),
        "hora" => $hora,
        "dia" => $dia
    ]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
