<?php
header('Content-Type: text/plain');

$nodejs_dir = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/nodejs';
$builds_dir = '/home/u723774100/domains/navajowhite-monkey-252201.hostingersite.com/public_html/.builds/source/repository';

echo "=== .builds/source/repository/ DIR ===\n";
if (is_dir($builds_dir)) {
    foreach (scandir($builds_dir) as $f)
        echo "$f\n";
} else {
    echo "NOT FOUND\n";
}

echo "\n=== CHECK index.js in builds ===\n";
echo "index.js: " . (file_exists($builds_dir . '/index.js') ? 'YES (' . filesize($builds_dir . '/index.js') . ' bytes)' : 'NO') . "\n";
echo "server.js: " . (file_exists($builds_dir . '/server.js') ? 'YES (' . filesize($builds_dir . '/server.js') . ' bytes)' : 'NO') . "\n";
echo "app.js: " . (file_exists($builds_dir . '/app.js') ? 'YES (' . filesize($builds_dir . '/app.js') . ' bytes)' : 'NO') . "\n";

echo "\n=== nodejs/server.js size ===\n";
echo filesize($nodejs_dir . '/server.js') . " bytes\n";

echo "\n=== Can we write to nodejs/ ? ===\n";
echo "is_writable: " . (is_writable($nodejs_dir) ? 'YES' : 'NO') . "\n";
echo "is_writable server.js: " . (is_writable($nodejs_dir . '/server.js') ? 'YES' : 'NO') . "\n";
?>