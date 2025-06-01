<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php';

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

$camposObrigatorios = ['id_tarefa', 'nome_tarefa', 'prioridade', 'hora_validade', 'dia'];
foreach ($camposObrigatorios as $campo) {
    if (!isset($_POST[$campo])) {
        http_response_code(400);
        echo json_encode(['erro' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

$id_tarefa = intval($_POST['id_tarefa']);
$nome_tarefa = trim($_POST['nome_tarefa']);
$descricao = isset($_POST['descricao']) ? trim($_POST['descricao']) : '';
$prioridade = $_POST['prioridade'];
$hora_validade = $_POST['hora_validade'];
$dia = strtolower($_POST['dia']);
$fk_id_disciplina = $_POST['fk_id_disciplina'] ?? null;
$fk_id_disciplina = $fk_id_disciplina !== '' ? intval($fk_id_disciplina) : null;

$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
if (!in_array($dia, $diasPermitidos)) {
    http_response_code(400);
    echo json_encode(['erro' => "Dia da semana inválido."]);
    exit;
}

$sql = "UPDATE tarefa 
        SET nome_tarefa = ?, descricao = ?, prioridade = ?, hora_validade = ?, dia_da_semana = ?, fk_id_disciplina = ?
        WHERE id_tarefa = ? AND fk_id_aluno = ?";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['erro' => "Erro ao preparar a consulta: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ssssssii", $nome_tarefa, $descricao, $prioridade, $hora_validade, $dia, $fk_id_disciplina, $id_tarefa, $id_aluno);
$resultado = $stmt->execute();

if ($resultado) {
    echo json_encode([
        'id_tarefa' => $id_tarefa,
        'nome_tarefa' => $nome_tarefa,
        'descricao' => $descricao,
        'prioridade' => $prioridade,
        'hora' => $hora_validade,
        'hora_validade' => $hora_validade,
        'dia' => $dia,
        'fk_id_disciplina' => $fk_id_disciplina
    ]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => "Erro ao atualizar a tarefa: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
