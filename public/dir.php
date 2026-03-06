<?php
header('Content-Type: text/plain');

$nodejs_dir = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/nodejs';

echo "=== ecosystem.config.cjs ===\n";
echo file_get_contents($nodejs_dir . '/ecosystem.config.cjs') . "\n";

echo "\n=== Check running node processes ===\n";
echo shell_exec('ps aux | grep node 2>&1') . "\n";

echo "\n=== Check port 3000 ===\n";
echo shell_exec('netstat -tlnp 2>&1 | head -20') . "\n";

echo "\n=== Try to restart via ecosystem ===\n";
echo shell_exec("cd $nodejs_dir && npx pm2 restart ecosystem.config.cjs 2>&1") . "\n";

echo "\n=== Try direct start ===\n";
echo shell_exec("cd $nodejs_dir && nohup node server.js > /dev/null 2>&1 &; echo 'Started'") . "\n";

echo "\n=== After start - check port 3000 ===\n";
sleep(2);
$ch = curl_init('http://127.0.0.1:3000/status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);
echo $error ? "Error: $error\n" : "Response: $response\n";
?>