<?php
header('Content-Type: text/plain');
echo "DIRECTORY LISTING OF PARENT:\n";
$files = scandir('..');
foreach ($files as $file) {
    echo $file . "\n";
}
echo "\nDIRECTORY LISTING OF CURRENT:\n";
$files = scandir('.');
foreach ($files as $file) {
    echo $file . "\n";
}
?>