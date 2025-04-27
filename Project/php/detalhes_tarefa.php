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
    $response = ["erro" => "Erro na conexão: " . $conexao->connect_error];
    echo isset($_GET['format']) && $_GET['format'] == 'json' ? json_encode($response) : $response["erro"];
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    $response = ["erro" => "Aluno não autenticado."];
    echo isset($_GET['format']) && $_GET['format'] == 'json' ? json_encode($response) : $response["erro"];
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

if (!isset($_GET['id_tarefa'])) {
    http_response_code(400);
    $response = ["erro" => "ID da tarefa não fornecido."];
    echo isset($_GET['format']) && $_GET['format'] == 'json' ? json_encode($response) : $response["erro"];
    exit;
}

$id_tarefa = intval($_GET['id_tarefa']);
$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
$dia_requisitado = isset($_GET['dia']) ? $_GET['dia'] : null;
$tarefaEncontrada = false;
$tarefaData = [];

if ($dia_requisitado && in_array($dia_requisitado, $diasPermitidos)) {
    $diasParaVerificar = [$dia_requisitado];
} else {
    $diasParaVerificar = $diasPermitidos;
}

foreach ($diasParaVerificar as $dia) {
    $tabela = "tarefa_" . $dia;
    $sql = "SELECT * FROM $tabela WHERE id_tarefa = ? AND fk_id_aluno = ?";
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) continue;
    
    $stmt->bind_param("ii", $id_tarefa, $id_aluno);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($row = $resultado->fetch_assoc()) {
        $tarefaEncontrada = true;
        $tarefaData = [
            'id_tarefa' => $row['id_tarefa'],
            'nome_tarefa' => $row['nome_tarefa'],
            'descricao' => $row['descricao'],
            'prioridade' => $row['prioridade'],
            'hora' => $row['hora_validade'],
            'hora_validade' => $row['hora_validade'],
            'data_criacao_tarefa' => $row['data_criacao_tarefa'],
            'dia' => $dia
        ];

        if (isset($_GET['format']) && $_GET['format'] == 'json') {
            header('Content-Type: application/json');
            echo json_encode($tarefaData);
        } else {
            echo "<div><strong>Nome:</strong> " . htmlspecialchars($row['nome_tarefa']) . "</div>";
            echo "<div><strong>Descrição:</strong> " . nl2br(htmlspecialchars($row['descricao'])) . "</div>";
            echo "<div><strong>Prioridade:</strong> " . htmlspecialchars($row['prioridade']) . "</div>";
            echo "<div><strong>Horário:</strong> " . htmlspecialchars($row['hora_validade']) . "</div>";
            echo "<div><strong>Data de Criação:</strong> " . htmlspecialchars($row['data_criacao_tarefa']) . "</div>";
        }
        
        break;
    }
    
    $stmt->close();
}

if (!$tarefaEncontrada) {
    $mensagem = "Tarefa não encontrada.";
    if (isset($_GET['format']) && $_GET['format'] == 'json') {
        header('Content-Type: application/json');
        echo json_encode(["erro" => $mensagem]);
    } else {
        echo $mensagem;
    }
}

$conexao->close();
?>