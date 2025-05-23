<?php
$host = 'localhost';
$db = 'estudomais';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$ras = [];

$resRA = $conn->query("SELECT id_ra, nome_ra, peso_ra FROM ra ORDER BY id_ra DESC");
while ($ra = $resRA->fetch_assoc()) {
    $id_ra = $ra['id_ra'];

    // Buscar provas (agora com peso)
    $resProvas = $conn->query("SELECT nome_prova, nota, peso FROM prova WHERE fk_id_ra = $id_ra");
    $provas = [];
    while ($p = $resProvas->fetch_assoc()) {
        $provas[] = $p;
    }

    // Buscar trabalhos (agora com peso)
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
