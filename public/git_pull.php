<?php
header('Content-Type: text/plain');
echo "=== Git Pull ===\n";
echo shell_exec('git pull 2>&1');
echo "\n=== status ===\n";
echo shell_exec('git status 2>&1');
?>
