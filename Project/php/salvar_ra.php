<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

$host = 'localhost:3306';
$db = 'estudomais';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
header('Content-Type: application/json');

// Verificar sessão
if (!isset($_SESSION['id_aluno'])) {
    echo json_encode(["success" => false, "message" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$raNome = $_POST['ra_nome'];
$raPeso = $_POST['ra_peso'];

// Validação simples
if (!$raNome || !$raPeso) {
    echo json_encode(["success" => false, "message" => "Nome ou peso do RA não recebido."]);
    exit;
}

// Inserir no banco com o ID do aluno
$stmt = $conn->prepare("INSERT INTO ra (nome_ra, peso_ra, fk_id_aluno) VALUES (?, ?, ?)");
$stmt->bind_param("sii", $raNome, $raPeso, $id_aluno);

if ($stmt->execute()) {
    $id_ra = $conn->insert_id;
    echo json_encode([
        "success" => true,
        "message" => "RA salvo com sucesso!",
        "id_ra" => $id_ra
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao salvar RA: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
