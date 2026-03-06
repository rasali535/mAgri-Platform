<?php
header('Content-Type: text/plain');
echo "DIRECTORY LISTING OF ../public_html:\n";
$files = scandir('../public_html');
foreach ($files as $file) {
    echo $file . "\n";
}
?>