<?php
session_start();
session_unset();
session_destroy();
header("Location: /Projeto-Planner/Project/html/login_suporte.html");
exit;
?>
