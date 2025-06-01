<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'conexao.php';

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

if (!isset($_GET['id_tarefa'])) {
    http_response_code(400);
    echo json_encode(["erro" => "ID da tarefa não fornecido."]);
    exit;
}

$id_tarefa = intval($_GET['id_tarefa']);

$sql = "SELECT t.id_tarefa, t.nome_tarefa, t.descricao, t.prioridade, t.hora_validade,
               t.data_criacao_tarefa, t.dia_da_semana, t.fk_id_disciplina, d.nome_disciplina
        FROM tarefa t
        LEFT JOIN disciplina d ON t.fk_id_disciplina = d.id_disciplina
        WHERE t.id_tarefa = ? AND t.fk_id_aluno = ?";

$stmt = $conexao->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro no prepare: " . $conexao->error]);
    exit;
}

$stmt->bind_param("ii", $id_tarefa, $id_aluno);
$stmt->execute();
$resultado = $stmt->get_result();

if ($row = $resultado->fetch_assoc()) {
    $tarefaData = [
        'id_tarefa' => $row['id_tarefa'],
        'nome_tarefa' => $row['nome_tarefa'],
        'descricao' => $row['descricao'],
        'prioridade' => $row['prioridade'],
        'hora' => $row['hora_validade'],
        'hora_validade' => $row['hora_validade'],
        'data_criacao_tarefa' => $row['data_criacao_tarefa'],
        'dia' => $row['dia_da_semana'],
        'fk_id_disciplina' => $row['fk_id_disciplina'],
        'nome_disciplina' => $row['nome_disciplina'] ?? null
    ];

    if (isset($_GET['format']) && $_GET['format'] === 'json') {
        header('Content-Type: application/json');
        echo json_encode($tarefaData);
    } else {
        echo "<div><strong>Nome:</strong> " . htmlspecialchars($row['nome_tarefa']) . "</div>";
        echo "<div><strong>Descrição:</strong> " . nl2br(htmlspecialchars($row['descricao'])) . "</div>";
        echo "<div><strong>Prioridade:</strong> " . htmlspecialchars($row['prioridade']) . "</div>";
        echo "<div><strong>Horário:</strong> " . htmlspecialchars($row['hora_validade']) . "</div>";
        echo "<div><strong>Data de Criação:</strong> " . htmlspecialchars($row['data_criacao_tarefa']) . "</div>";
        echo "<div><strong>Dia:</strong> " . htmlspecialchars($row['dia_da_semana']) . "</div>";
        if (!empty($row['nome_disciplina'])) {
            echo "<div><strong>Disciplina:</strong> " . htmlspecialchars($row['nome_disciplina']) . "</div>";
        }
    }
} else {
    http_response_code(404);
    $mensagem = "Tarefa não encontrada.";
    echo isset($_GET['format']) && $_GET['format'] === 'json' ? json_encode(["erro" => $mensagem]) : $mensagem;
}

$stmt->close();
$conexao->close();
?>
