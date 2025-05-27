<?php
session_start();

$host = 'localhost:3306';
$db = 'estudomais';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

// Verificar se aluno está logado
if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(["erro" => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];
$ras = [];

// Buscar RAs apenas do aluno
$stmtRA = $conn->prepare("SELECT id_ra, nome_ra, peso_ra FROM ra WHERE fk_id_aluno = ? ORDER BY id_ra DESC");
$stmtRA->bind_param("i", $id_aluno);
$stmtRA->execute();
$resRA = $stmtRA->get_result();

while ($ra = $resRA->fetch_assoc()) {
    $id_ra = $ra['id_ra'];

    // Buscar provas
    $resProvas = $conn->query("SELECT nome_prova, nota, peso FROM prova WHERE fk_id_ra = $id_ra");
    $provas = [];
    while ($p = $resProvas->fetch_assoc()) {
        $provas[] = $p;
    }

    // Buscar trabalhos
    $resTrabalhos = $conn->query("SELECT nome_trabalho, nota, peso FROM trabalho WHERE fk_id_ra = $id_ra");
    $trabalhos = [];
    while ($t = $resTrabalhos->fetch_assoc()) {
        $trabalhos[] = $t;
    }

    $ra['provas'] = $provas;
    $ra['trabalhos'] = $trabalhos;

    $ras[] = $ra;
}

header("Content-Type: application/json");
echo json_encode($ras);
$conn->close();
?>
