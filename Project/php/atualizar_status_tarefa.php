<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'estudomais';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);
$id = intval(str_replace('card-db-', '', $data['id']));
$status = $conn->real_escape_string($data['column']);

$sql = "UPDATE tarefa SET status = '$status' WHERE id_tarefa = $id";
$conn->query($sql);

echo json_encode(['success' => $conn->affected_rows > 0]);
$conn->close();
?>
