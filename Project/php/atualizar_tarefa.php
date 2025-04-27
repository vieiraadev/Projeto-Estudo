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
    echo json_encode(['erro' => "Erro na conexão: " . $conexao->connect_error]);
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

if (!isset($_POST['id_tarefa']) || !isset($_POST['nome_tarefa']) || !isset($_POST['prioridade']) || !isset($_POST['hora_validade']) || !isset($_POST['dia'])) {
    http_response_code(400);
    echo json_encode(['erro' => "Dados incompletos para atualização."]);
    exit;
}

$id_tarefa = intval($_POST['id_tarefa']);
$nome_tarefa = trim($_POST['nome_tarefa']);
$descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
$prioridade = $_POST['prioridade'];
$hora_validade = $_POST['hora_validade'];
$dia = $_POST['dia'];

$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
if (!in_array($dia, $diasPermitidos)) {
    http_response_code(400);
    echo json_encode(['erro' => "Dia da semana inválido."]);
    exit;
}

$tabela = "tarefa_" . $dia;
$sql = "UPDATE $tabela SET nome_tarefa = ?, descricao = ?, prioridade = ?, hora_validade = ? 
        WHERE id_tarefa = ? AND fk_id_aluno = ?";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['erro' => "Erro ao preparar a consulta: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ssssii", $nome_tarefa, $descricao, $prioridade, $hora_validade, $id_tarefa, $id_aluno);
$resultado = $stmt->execute();

if ($resultado) {
    $tarefaAtualizada = [
        'id_tarefa' => $id_tarefa,
        'nome_tarefa' => $nome_tarefa,
        'descricao' => $descricao,
        'prioridade' => $prioridade,
        'hora' => $hora_validade,
        'hora_validade' => $hora_validade,
        'dia' => $dia
    ];
    
    echo json_encode($tarefaAtualizada);
} else {
    http_response_code(500);
    echo json_encode(['erro' => "Erro ao atualizar a tarefa: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>