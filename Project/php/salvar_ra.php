<?php
$host = 'localhost';
$db = 'estudomais';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$raNome = $_POST['ra_nome'];
$raPeso = $_POST['ra_peso'];

// Validação simples
if (!$raNome || !$raPeso) {
    echo json_encode(["success" => false, "message" => "Nome ou peso do RA não recebido."]);
    exit;
}

// Inserir no banco
$stmt = $conn->prepare("INSERT INTO ra (nome_ra, peso_ra) VALUES (?, ?)");
$stmt->bind_param("si", $raNome, $raPeso);

if ($stmt->execute()) {
    $id_ra = $conn->insert_id; // Pega o ID recém-criado
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
