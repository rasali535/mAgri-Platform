<?php
header('Content-Type: text/plain');

echo "=== DOCUMENT ROOT ===\n";
echo $_SERVER['DOCUMENT_ROOT'] . "\n\n";

echo "=== CURRENT DIR (.) ===\n";
foreach (scandir('.') as $f)
    echo "$f\n";

echo "\n=== PARENT DIR (..) ===\n";
foreach (scandir('..') as $f)
    echo "$f\n";

echo "\n=== nodejs/ DIR ===\n";
if (is_dir('../nodejs')) {
    foreach (scandir('../nodejs') as $f)
        echo "$f\n";
} else {
    echo "NOT FOUND\n";
}

echo "\n=== .builds/ DIR ===\n";
if (is_dir('.builds')) {
    foreach (scandir('.builds') as $f)
        echo "$f\n";
} else {
    echo "NOT FOUND\n";
}

echo "\n=== CHECK index.js ===\n";
echo "In public_html: " . (file_exists('index.js') ? 'YES' : 'NO') . "\n";
echo "In parent: " . (file_exists('../index.js') ? 'YES' : 'NO') . "\n";
echo "In nodejs/: " . (file_exists('../nodejs/index.js') ? 'YES' : 'NO') . "\n";
echo "In .builds/: " . (file_exists('.builds/index.js') ? 'YES' : 'NO') . "\n";

echo "\n=== SERVER VARS ===\n";
echo "SERVER_SOFTWARE: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "\n";
echo "SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'N/A') . "\n";
?>