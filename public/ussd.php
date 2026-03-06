<?php
/**
 * mAgri USSD Gateway Handler (PHP)
 * 
 * This handles USSD requests from Africa's Talking.
 * Place this in public/ so it deploys to public_html/ on Hostinger.
 * 
 * Africa's Talking callback URL: https://navajowhite-monkey-252201.hostingersite.com/ussd.php
 */

header('Content-Type: text/plain');

// Get USSD parameters from POST or GET
$sessionId = isset($_POST['sessionId']) ? $_POST['sessionId'] : (isset($_GET['sessionId']) ? $_GET['sessionId'] : '');
$serviceCode = isset($_POST['serviceCode']) ? $_POST['serviceCode'] : (isset($_GET['serviceCode']) ? $_GET['serviceCode'] : '');
$phoneNumber = isset($_POST['phoneNumber']) ? $_POST['phoneNumber'] : (isset($_GET['phoneNumber']) ? $_GET['phoneNumber'] : '');
$text = isset($_POST['text']) ? $_POST['text'] : (isset($_GET['text']) ? $_GET['text'] : '');

// Log the request
$logEntry = date('Y-m-d H:i:s') . " | Session: $sessionId | Phone: $phoneNumber | Text: '$text'\n";
file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);

// USSD Menu Logic
$response = '';

if ($text == '') {
    // Main menu
    $response = "CON Welcome to mAgri Platform\n";
    $response .= "1. Check Credit Score\n";
    $response .= "2. Apply for Micro-Credit\n";
    $response .= "3. Check Weather Forecast\n";
    $response .= "4. SMS Agronomist\n";
    $response .= "5. View/Respond to Buyer SMS";
} elseif ($text == '1') {
    $response = "END Your current mAgri Credit Score is 745 (Excellent).";
    sendSMS($phoneNumber, "Your current mAgri Credit Score is 745 (Excellent). Keep up the good work!");
} elseif ($text == '2') {
    $response = "END Your application for KES 5,000 micro-credit has been received. You will receive an SMS confirmation.";
    sendSMS($phoneNumber, "mAgri Alert: Your application for KES 5,000 micro-credit has been received.");
} elseif ($text == '3') {
    $response = "END Weather forecast for your region: Sunny with light showers.";
    sendSMS($phoneNumber, "mAgri Weather: Sunny with light showers in the evening.");
} elseif ($text == '4') {
    $response = "CON Please type your question for the agronomist:";
} elseif (strpos($text, '4*') === 0) {
    $response = "END Your message has been sent to our expert agronomists.";
    sendSMS($phoneNumber, "mAgri: Your question has been routed. Expect a reply shortly.");
} elseif ($text == '5') {
    $response = "END You have 1 new message from a Buyer: \"Interested in 500kg Maize.\"";
    sendSMS($phoneNumber, "mAgri Buyer Alert: New message received. Dial *384*14032*5# to respond.");
} else {
    $response = "END Invalid option. Please try again.";
}

echo $response;

/**
 * Send SMS via Africa's Talking API
 */
function sendSMS($to, $message)
{
    $username = getenv('AT_USERNAME') ?: 'sandbox';
    $apiKey = getenv('AT_API_KEY');

    if (!$apiKey) {
        // Simulate SMS if no API key
        $logEntry = date('Y-m-d H:i:s') . " | [SIMULATED SMS to $to]: $message\n";
        file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);
        return;
    }

    $url = 'https://api.africastalking.com/version1/messaging';
    $data = array(
        'username' => $username,
        'to' => $to,
        'message' => $message
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

    $result = curl_exec($ch);
    curl_close($ch);

    $logEntry = date('Y-m-d H:i:s') . " | SMS to $to: $result\n";
    file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);
}
?>