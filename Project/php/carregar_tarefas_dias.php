<?php
session_start();

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado"]);
    exit();
}

$id_aluno = $_SESSION['id_aluno'];

$host = 'localhost';
$usuario = 'root';
$senha = '';
$banco = 'estudomais';
$porta = 3306;

$conexao = new mysqli($host, $usuario, $senha, $banco, $porta);
if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro de conexão"]);
    exit();
}

$dias_map = [
    'Seg' => 'segunda',
    'Ter' => 'terca',
    'Qua' => 'quarta',
    'Qui' => 'quinta',
    'Sex' => 'sexta'
];

$resultado = [];

foreach ($dias_map as $sigla => $nome_completo) {
    $stmt = $conexao->prepare("
        SELECT nome_tarefa 
        FROM tarefa 
        WHERE dia_da_semana = ? AND fk_id_aluno = ?
    ");
    $stmt->bind_param("si", $nome_completo, $id_aluno);
    $stmt->execute();
    $res = $stmt->get_result();

    $tarefas = [];
    while ($row = $res->fetch_assoc()) {
        $tarefas[] = $row['nome_tarefa'];
    }

    $resultado[$sigla] = $tarefas;
}

header('Content-Type: application/json');
echo json_encode($resultado);
?>
