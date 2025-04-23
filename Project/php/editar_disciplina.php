<?php
header('Content-Type: application/json');

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

// Verifica se os dados foram recebidos
if (!isset($_POST['id_disciplina'], $_POST['nome_disciplina'])) {
    echo json_encode(["status" => "erro", "erro" => "Dados incompletos"]);
    exit;
}

$id = intval($_POST['id_disciplina']);
$nome = $conexao->real_escape_string($_POST['nome_disciplina']);
$descricao = isset($_POST['descricao_disciplina']) ? $conexao->real_escape_string($_POST['descricao_disciplina']) : null;

// Atualiza a disciplina
$sql = "UPDATE disciplina SET nome_disciplina = '$nome', descricao_disciplina = " . ($descricao ? "'$descricao'" : "NULL") . " WHERE id_disciplina = $id";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(["status" => "sucesso"]);
} else {
    echo json_encode(["status" => "erro", "erro" => "Erro ao atualizar: " . $conexao->error]);
}

$conexao->close();
?>
