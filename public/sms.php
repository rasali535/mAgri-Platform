<?php
/**
 * mAgri SMS Gateway Handler (PHP)
 * 
 * This handles incoming SMS from Africa's Talking.
 * Callback URL: https://navajowhite-monkey-252201.hostingersite.com/sms.php
 */

header('Content-Type: text/plain');

$from = isset($_POST['from']) ? $_POST['from'] : (isset($_GET['from']) ? $_GET['from'] : '');
$text = isset($_POST['text']) ? $_POST['text'] : (isset($_GET['text']) ? $_GET['text'] : '');

// Log
$logEntry = date('Y-m-d H:i:s') . " | SMS from $from: $text\n";
file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);

if (stripos($text, 'help') !== false) {
    $username = getenv('AT_USERNAME') ?: 'sandbox';
    $apiKey = getenv('AT_API_KEY');

    if ($apiKey) {
        $url = 'https://api.africastalking.com/version1/messaging';
        $data = array(
            'username' => $username,
            'to' => $from,
            'message' => "Welcome to mAgri Help. Reply with 'CREDIT', 'WEATHER', or 'MARKET'."
        );

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'apiKey: ' . $apiKey
        ));
        curl_exec($ch);
        curl_close($ch);
    }
}

echo "SMS Received";
?>