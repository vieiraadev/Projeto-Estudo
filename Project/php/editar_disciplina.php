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

if (!isset($_POST['id_disciplina'], $_POST['nome_disciplina'])) {
    echo json_encode(["status" => "erro", "erro" => "Dados incompletos"]);
    exit;
}
// Protege o ID de disciplina (forçando que seja inteiro)
$id = intval($_POST['id_disciplina']);
$nome = $conexao->real_escape_string($_POST['nome_disciplina']);
$descricao = isset($_POST['descricao_disciplina']) ? $conexao->real_escape_string($_POST['descricao_disciplina']) : null;

// Monta a query de atualização
// Se tiver descrição, ela é incluída entre aspas, senão é setada como NULL
$sql = "UPDATE disciplina SET nome_disciplina = '$nome', descricao_disciplina = " . ($descricao ? "'$descricao'" : "NULL") . " WHERE id_disciplina = $id";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(["status" => "sucesso"]);
} else {
    echo json_encode(["status" => "erro", "erro" => "Erro ao atualizar: " . $conexao->error]);
}

$conexao->close();
?>
