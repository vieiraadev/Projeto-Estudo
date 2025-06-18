<?php
session_start();

if (!isset($_SESSION['id_aluno'])) {
    http_response_code(401);
    echo json_encode(['erro' => "Aluno não autenticado."]);
    exit;
}

$id_aluno = $_SESSION['id_aluno'];

$host = 'localhost';
$db = 'estudomais';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['erro' => "Erro de conexão."]);
    exit;
}

// Buscar provas do aluno logado
$provas = $conn->prepare("
    SELECT nome_prova AS nome, nota, peso, fk_id_ra, 'prova' AS tipo 
    FROM prova 
    WHERE fk_id_ra = ?
");
$provas->bind_param("i", $id_aluno);
$provas->execute();
$resProvas = $provas->get_result();

// Buscar trabalhos do aluno logado
$trabalhos = $conn->prepare("
    SELECT nome_trabalho AS nome, nota, peso, fk_id_ra, 'trabalho' AS tipo 
    FROM trabalho 
    WHERE fk_id_ra = ?
");
$trabalhos->bind_param("i", $id_aluno);
$trabalhos->execute();
$resTrabalhos = $trabalhos->get_result();

// Combinar os resultados
$dados = [];
while ($p = $resProvas->fetch_assoc()) $dados[] = $p;
while ($t = $resTrabalhos->fetch_assoc()) $dados[] = $t;

echo json_encode($dados);
?>
