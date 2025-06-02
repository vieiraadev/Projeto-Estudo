<?php
session_start();
header('Content-Type: application/json');

require_once 'conexao.php';

$response = [
    'success' => false,
    'message' => 'Erro desconhecido.'
];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $duvida = $_POST['duvida'] ?? '';
    $id_aluno = $_SESSION['id_aluno'] ?? null;

    if (!empty($duvida) && $id_aluno !== null) {
        $stmt = $conexao->prepare("INSERT INTO suporte (mensagem, fk_id_aluno) VALUES (?, ?)");
        $stmt->bind_param("si", $duvida, $id_aluno);

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Sua dúvida foi enviada com sucesso!';
        } else {
            $response['message'] = 'Erro ao enviar a dúvida.';
        }

        $stmt->close();
    } else {
        $response['message'] = 'Digite uma dúvida antes de enviar.';
    }
}

$conexao->close();
echo json_encode($response);
