<?php
// get_tarefas.php
session_start();
header('Content-Type: application/json');

require_once 'conexao.php'; // Arquivo com a conexão $conexao

// Verifica se o aluno está logado
if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["erro" => "Aluno não autenticado"]);
    exit;
}

$idAluno = $_SESSION['id_aluno'];

// Verifica erro de conexão
if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão com o banco"]);
    exit;
}

// Consulta tarefas do aluno logado
$sql = "SELECT nome_tarefa, data_criacao_tarefa, prioridade FROM tarefa WHERE fk_id_aluno = ? ORDER BY data_criacao_tarefa DESC LIMIT 5";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $idAluno);
$stmt->execute();
$result = $stmt->get_result();

$tarefas = [];

while ($row = $result->fetch_assoc()) {
    $criado = new DateTime($row['data_criacao_tarefa']);
    $hoje = new DateTime();
    $dias = $criado->diff($hoje)->format("%r%a");

    if ($dias == 0) {
        $textoData = "Criado hoje";
    } elseif ($dias == 1) {
        $textoData = "Criado ontem";
    } else {
        $textoData = "Criado há $dias dias";
    }

    $tarefas[] = [
        "titulo" => $row['nome_tarefa'],
        "data" => $textoData,
        "prioridade" => strtolower($row['prioridade'])
    ];
}

echo json_encode($tarefas);
$conexao->close();
