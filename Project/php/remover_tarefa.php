<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

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

if (!isset($_POST['id_tarefa'], $_POST['dia'])) {
    http_response_code(400);
    echo json_encode(["erro" => "ID da tarefa ou dia não fornecido."]);
    exit;
}

$id_tarefa = intval($_POST['id_tarefa']);
$dia = $_POST['dia'];

$dias_validos = [
    "segunda" => "tarefa_segunda",
    "terca"   => "tarefa_terca",
    "quarta"  => "tarefa_quarta",
    "quinta"  => "tarefa_quinta",
    "sexta"   => "tarefa_sexta"
];

if (!array_key_exists($dia, $dias_validos)) {
    http_response_code(400);
    echo json_encode(["erro" => "Dia inválido."]);
    exit;
}

$tabela = $dias_validos[$dia];

$sql = "DELETE FROM $tabela WHERE id_tarefa = ? AND fk_id_aluno = ?";
$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ii", $id_tarefa, $id_aluno);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["erro" => "Tarefa não encontrada ou não pertence ao aluno."]);
    }
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao deletar: " . $stmt->error]);
}

$stmt->close();
$conexao->close();
?>
