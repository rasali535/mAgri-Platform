<?php
header('Content-Type: text/plain');

$base = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/nodejs';

echo "=== server.js (first 80 lines) ===\n";
$lines = file($base . '/server.js');
for ($i = 0; $i < min(80, count($lines)); $i++) {
    echo $lines[$i];
}

echo "\n\n=== ecosystem.config.cjs ===\n";
echo file_get_contents($base . '/ecosystem.config.cjs');

echo "\n\n=== package.json ===\n";
echo file_get_contents($base . '/package.json');

echo "\n\n=== stderr.log (last 30 lines) ===\n";
$lines = file($base . '/stderr.log');
$start = max(0, count($lines) - 30);
for ($i = $start; $i < count($lines); $i++) {
    echo $lines[$i];
}

echo "\n\n=== .env.example ===\n";
echo file_get_contents($base . '/.env.example');

echo "\n\n=== nodejs/dist/ DIR ===\n";
if (is_dir($base . '/dist')) {
    foreach (scandir($base . '/dist') as $f)
        echo "$f\n";
} else {
    echo "NOT FOUND\n";
}
?>