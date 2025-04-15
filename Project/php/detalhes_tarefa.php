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
    echo "Erro na conexão: " . $conexao->connect_error;
    exit;
}

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo "Aluno não autenticado.";
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

if (!isset($_GET['id_tarefa'])) {
    http_response_code(400);
    echo "ID da tarefa não fornecido.";
    exit;
}

$id_tarefa = intval($_GET['id_tarefa']);

$diasPermitidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];

$tarefaEncontrada = false;

foreach ($diasPermitidos as $dia) {
    $tabela = "tarefa_" . $dia;
    $sql = "SELECT * FROM $tabela WHERE id_tarefa = ? AND fk_id_aluno = ?";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) continue;

    $stmt->bind_param("ii", $id_tarefa, $id_aluno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($row = $resultado->fetch_assoc()) {
        echo "<div><strong>Nome:</strong> " . htmlspecialchars($row['nome_tarefa']) . "</div>";
        echo "<div><strong>Descrição:</strong> " . nl2br(htmlspecialchars($row['descricao'])) . "</div>";
        echo "<div><strong>Prioridade:</strong> " . htmlspecialchars($row['prioridade']) . "</div>";
        echo "<div><strong>Horário:</strong> " . htmlspecialchars($row['hora_validade']) . "</div>";
        echo "<div><strong>Data de Criação:</strong> " . htmlspecialchars($row['data_criacao_tarefa']) . "</div>";
        $tarefaEncontrada = true;
        break;
    }

    $stmt->close();
}

if (!$tarefaEncontrada) {
    echo "Tarefa não encontrada.";
}

$conexao->close();
?>
