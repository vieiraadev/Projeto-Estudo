<?php
require_once 'conexao.php';

$id_ra = $_POST['id_ra'] ?? null;
$provas = isset($_POST['provas']) ? json_decode($_POST['provas'], true) : [];
$trabalhos = isset($_POST['trabalhos']) ? json_decode($_POST['trabalhos'], true) : [];
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("POST: " . json_encode($_POST));

// Adicione logs para debug!
error_log("PROVAS: " . json_encode($provas));
error_log("TRABALHOS: " . json_encode($trabalhos));
error_log("ID_RA: " . $id_ra);

if (!$id_ra) {
    echo json_encode(["success" => false, "message" => "ID do RA não fornecido."]);
    exit;
}


// REMOVE as avaliações antigas antes de inserir as novas
$conexao->query("DELETE FROM prova WHERE fk_id_ra = $id_ra");
$conexao->query("DELETE FROM trabalho WHERE fk_id_ra = $id_ra");

// Inserir provas
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

// Inserir trabalhos
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
