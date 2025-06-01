<?php
$host = 'localhost:3306'; 
$usuario = 'root';
$senha = '';
$banco = 'estudomais';

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die('Erro de conexão: ' . $conexao->connect_error);
}
?>
