<?php
session_start();

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Aluno não logado']);
    exit;
}

$id_aluno = intval($_SESSION['id_aluno']);

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'estudomais';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$sql = "SELECT 
            t.id_tarefa,
            t.nome_tarefa,
            t.prioridade,
            t.data_criacao_tarefa,
            t.status,
            t.descricao,
            t.dia_da_semana,
            d.nome_disciplina AS disciplina
        FROM tarefa t
        LEFT JOIN disciplina d ON t.fk_id_disciplina = d.id_disciplina
        WHERE t.fk_id_aluno = $id_aluno";

$result = $conn->query($sql);

$tarefas = [];
while ($row = $result->fetch_assoc()) {
    $tarefas[] = [
        'id' => 'card-db-' . $row['id_tarefa'],
        'title' => $row['nome_tarefa'],
        'priority' => strtolower($row['prioridade'] ?? 'medium'),
        'date' => substr($row['data_criacao_tarefa'], 0, 10),
        'column' => $row['status'] ?? 'backlog',
        'progress' => 0,
        'descricao' => $row['descricao'] ?? '',
        'dia_da_semana' => $row['dia_da_semana'] ?? '',
        'disciplina' => $row['disciplina'] ?? ''
    ];
}

header('Content-Type: application/json');
echo json_encode($tarefas);
$conn->close();
?>
