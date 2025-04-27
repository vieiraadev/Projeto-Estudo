<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

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

if (!isset($_GET['dia'])) {
    http_response_code(400);
    echo json_encode(["erro" => "Dia da semana não especificado."]);
    exit;
}

$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

$dia = strtolower($_GET['dia']);
if (!in_array($dia, $diasPermitidos)) {
    http_response_code(400);
    echo json_encode(["erro" => "Dia inválido."]);
    exit;
}

$tabela = "tarefa_" . $dia;

$sql = "SELECT id_tarefa, nome_tarefa, prioridade, hora_validade FROM $tabela WHERE fk_id_aluno = ?";
$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}


$stmt->bind_param("i", $id_aluno);
$stmt->execute();

$resultado = $stmt->get_result();
$tarefas = [];

while ($row = $resultado->fetch_assoc()) {
    $hora_original = $row["hora_validade"] ?? "";

    // Formatar hora: de "HH:MM:SS" para "HH:MM"
    $hora_formatada = "";
    if ($hora_original) {
        $hora_formatada = (new DateTime($hora_original))->format('H:i');
    }

    $tarefas[] = [
        "id_tarefa" => $row["id_tarefa"],
        "nome_tarefa" => $row["nome_tarefa"],
        "prioridade" => strtolower($row["prioridade"]),
        "hora" => $hora_formatada
    ];
}
error_log(json_encode($tarefas));

echo json_encode($tarefas);


$stmt->close();
$conexao->close();
?>
