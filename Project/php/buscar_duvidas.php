<?php
require_once 'conexao.php'; // substitui a conexão direta

if ($conexao->connect_errno) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão"]);
    exit;
}

$query = "SELECT suporte.id, suporte.mensagem, suporte.resposta, suporte.data_envio, aluno.nome_aluno 
          FROM suporte 
          INNER JOIN aluno ON aluno.id_aluno = suporte.fk_id_aluno 
          ORDER BY suporte.id DESC";

$result = $conexao->query($query);

$duvidas = [];

while ($row = $result->fetch_assoc()) {
    $duvidas[] = [
        'id' => $row['id'],
        'mensagem' => $row['mensagem'],
        'resposta' => $row['resposta'], 
        'data_envio' => $row['data_envio'],
        'nome' => $row['nome_aluno'] 
    ];
}

header('Content-Type: application/json');
echo json_encode($duvidas);
?>
