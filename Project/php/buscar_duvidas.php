<?php
$mysqli = new mysqli("localhost", "root", "", "estudomais");

if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro na conexão"]);
    exit;
}

$query = "SELECT suporte.id, suporte.mensagem, suporte.data_envio, aluno.nome_aluno 
          FROM suporte 
          INNER JOIN aluno ON aluno.id_aluno = suporte.fk_id_aluno 
          ORDER BY suporte.id DESC";

$result = $mysqli->query($query);

$duvidas = [];

while ($row = $result->fetch_assoc()) {
    $duvidas[] = [
        'id' => $row['id'],
        'mensagem' => $row['mensagem'],
        'data_envio' => $row['data_envio'],
        'nome' => $row['nome_aluno'] 
    ];
}

header('Content-Type: application/json');
echo json_encode($duvidas);
?>
