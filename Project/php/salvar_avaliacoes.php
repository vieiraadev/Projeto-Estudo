<?php
require_once 'conexao.php';

$id_ra = $_POST['id_ra'] ?? null;
$provas = json_decode($_POST['provas'], true);
$trabalhos = json_decode($_POST['trabalhos'], true);

if (!$id_ra) {
    echo json_encode(["success" => false, "message" => "ID do RA não fornecido."]);
    exit;
}

// 1. Inserir provas
if (!empty($provas)) {
    $stmtProva = $conexao->prepare("INSERT INTO prova (nome_prova, nota, peso, fk_id_ra) VALUES (?, ?, ?, ?)");
    foreach ($provas as $p) {
        if (isset($p['nome'], $p['nota'], $p['peso'])) {
            $stmtProva->bind_param("sdii", $p['nome'], $p['nota'], $p['peso'], $id_ra);
            $stmtProva->execute();
        }
    }
    $stmtProva->close();
}

// 2. Inserir trabalhos
if (!empty($trabalhos)) {
    $stmtTrab = $conexao->prepare("INSERT INTO trabalho (nome_trabalho, nota, peso, fk_id_ra) VALUES (?, ?, ?, ?)");
    foreach ($trabalhos as $t) {
        if (isset($t['nome'], $t['nota'], $t['peso'])) {
            $stmtTrab->bind_param("sdii", $t['nome'], $t['nota'], $t['peso'], $id_ra);
            $stmtTrab->execute();
        }
    }
    $stmtTrab->close();
}

echo json_encode(["success" => true, "message" => "Notas salvas com sucesso!"]);
$conexao->close();
?>
