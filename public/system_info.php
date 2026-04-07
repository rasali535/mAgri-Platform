<?php
header('Content-Type: text/plain');
echo "Current working directory: " . getcwd() . "\n";
echo "Document root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Contents of current directory:\n";
print_r(scandir('.'));
echo "\nContents of parent directory:\n";
print_r(scandir('..'));
?>
