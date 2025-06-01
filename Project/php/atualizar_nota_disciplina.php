<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$id = intval($input['id_disciplina']);
$nota = floatval($input['nota']);

require_once 'conexao.php'; // substitui a conexão direta com o banco

$stmt = $conexao->prepare("UPDATE disciplina SET nota = ? WHERE id_disciplina = ?");
$stmt->bind_param("di", $nota, $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["sucesso" => true]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhuma linha atualizada"]);
}

$stmt->close();
$conexao->close();
?>
