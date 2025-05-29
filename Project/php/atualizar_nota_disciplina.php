<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$id = intval($input['id_disciplina']);
$nota = floatval($input['nota']);

$con = new mysqli("localhost:3306", "root", "", "estudomais");
if ($con->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Conexão falhou"]);
    exit;
}

$stmt = $con->prepare("UPDATE disciplina SET nota = ? WHERE id_disciplina = ?");
$stmt->bind_param("di", $nota, $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["sucesso" => true]);
} else {
    echo json_encode(["sucesso" => false, "mensagem" => "Nenhuma linha atualizada"]);
}

$stmt->close();
$con->close();
?>
