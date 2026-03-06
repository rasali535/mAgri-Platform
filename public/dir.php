<?php
header('Content-Type: text/plain');

$nodejs_dir = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/nodejs';

echo "=== Verify server.js was updated ===\n";
echo "Size: " . filesize($nodejs_dir . '/server.js') . " bytes\n";
echo "Modified: " . date('Y-m-d H:i:s', filemtime($nodejs_dir . '/server.js')) . "\n";

echo "\n=== First 5 lines of server.js ===\n";
$lines = file($nodejs_dir . '/server.js');
for ($i = 0; $i < min(5, count($lines)); $i++) {
    echo $lines[$i];
}

echo "\n\n=== stderr.log ===\n";
$log = $nodejs_dir . '/stderr.log';
if (file_exists($log) && filesize($log) > 0) {
    $lines = file($log);
    $start = max(0, count($lines) - 20);
    for ($i = $start; $i < count($lines); $i++) {
        echo $lines[$i];
    }
} else {
    echo "Empty or not found\n";
}

echo "\n=== Try localhost:3000/status ===\n";
$ch = curl_init('http://127.0.0.1:3000/status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "Error: $error\n";
} else {
    echo "HTTP $httpCode: $response\n";
}

echo "\n=== Try localhost:3000/ussd-health ===\n";
$ch = curl_init('http://127.0.0.1:3000/ussd-health');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "Error: $error\n";
} else {
    echo "HTTP $httpCode: $response\n";
}
?>