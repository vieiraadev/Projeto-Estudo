<?php
require_once 'conexao.php';
$id_ra = $_GET['id_ra'] ?? null;

$provas = [];
$trabalhos = [];
if ($id_ra) {
    $resProvas = $conexao->query("SELECT nome_prova, nota, peso FROM prova WHERE fk_id_ra = $id_ra");
    while ($p = $resProvas->fetch_assoc()) $provas[] = $p;
    $resTrabalhos = $conexao->query("SELECT nome_trabalho, nota, peso FROM trabalho WHERE fk_id_ra = $id_ra");
    while ($t = $resTrabalhos->fetch_assoc()) $trabalhos[] = $t;
}

echo json_encode([
    "provas" => $provas,
    "trabalhos" => $trabalhos
]);
?>
