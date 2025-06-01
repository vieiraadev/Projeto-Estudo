<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';
require_once 'conexao.php'; // substitui a conexão manual

date_default_timezone_set('America/Sao_Paulo');

// Pega o dia da semana completo, em minúsculas
$formatter = new IntlDateFormatter('pt_BR', IntlDateFormatter::FULL, IntlDateFormatter::NONE, null, null, 'cccc');
$diaSemanaHojeCompleto = strtolower($formatter->format(time())); // ex: "quarta-feira"

// Remove o "-feira" para combinar com o banco
$diaSemanaHoje = str_replace('-feira', '', $diaSemanaHojeCompleto); // ex: "quarta"

$horaAgora = new DateTime();

// Buscar tarefas do dia atual com e-mail do aluno e alerta não enviado
$sql = "SELECT t.*, a.email, a.nome_aluno
        FROM tarefa t
        JOIN aluno a ON t.fk_id_aluno = a.id_aluno
        WHERE t.dia_da_semana = ? AND (t.alerta_enviado IS NULL OR t.alerta_enviado = 0)";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("s", $diaSemanaHoje);
$stmt->execute();
$result = $stmt->get_result();

echo "🎯 Verificando tarefas para hoje: $diaSemanaHoje<br>";
echo "🔍 Total de tarefas encontradas: " . $result->num_rows . "<br>";

while ($tarefa = $result->fetch_assoc()) {
    $horaValidade = DateTime::createFromFormat('H:i:s', $tarefa['hora_validade']);
    if (!$horaValidade) continue;

    $horaAgoraCopia = clone $horaAgora;
    $horaValidade->setDate($horaAgora->format('Y'), $horaAgora->format('m'), $horaAgora->format('d'));

    $diff = $horaAgoraCopia->diff($horaValidade);
    $horasRestantes = ($horaValidade > $horaAgoraCopia) ? ($diff->days * 24 + (int)$diff->format('%h')) : -1;

    $minutosRestantes = ($horaValidade->getTimestamp() - $horaAgora->getTimestamp()) / 60;
    echo "Tarefa: {$tarefa['nome_tarefa']}<br>";
    echo "Hora atual: " . $horaAgora->format('H:i:s') . "<br>";
    echo "Hora validade: " . $horaValidade->format('H:i:s') . "<br>";
    echo "Minutos restantes: $minutosRestantes<br>";

    if ($minutosRestantes >= 0 && $minutosRestantes <= 180) {
        echo "⚠️ Enviando e-mail para {$tarefa['email']}<br>";

        $mail = new PHPMailer(true);
        try {
            // Configuração do servidor SMTP
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'arthuim@gmail.com';
            $mail->Password = 'sszr psud uufk qsil'; // Senha de app
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            // E-mail
            $mail->setFrom('arthuim@gmail.com', 'Planner Estudantil');
            $mail->addAddress($tarefa['email'], $tarefa['nome_aluno']);

            $mail->isHTML(true);
            $mail->Subject = "Lembrete: tarefa '{$tarefa['nome_tarefa']}' vence em 10h!";
            $mail->Body = "
                <p>Olá <strong>{$tarefa['nome_aluno']}</strong>,</p>
                <p>Sua tarefa <strong>{$tarefa['nome_tarefa']}</strong> está a menos de 10 horas da hora limite ({$tarefa['hora_validade']}).</p>
                <p><strong>Descrição:</strong> {$tarefa['descricao']}</p>
                <p><em>Organize-se para não perder o prazo!</em></p>
            ";

            $mail->send();

            // Marcar como enviado
            $update = $conexao->prepare("UPDATE tarefa SET alerta_enviado = 1 WHERE id_tarefa = ?");
            $update->bind_param("i", $tarefa['id_tarefa']);
            $update->execute();

            echo "E-mail enviado para {$tarefa['email']}<br>";
        } catch (Exception $e) {
            echo "Erro ao enviar para {$tarefa['email']}: {$mail->ErrorInfo}<br>";
        }
    }
}
?>
