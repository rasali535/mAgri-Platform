<?php
/**
 * mARI Platform - USSD Proxy Bridge
 * 
 * This file forwards USSD requests from Hostinger to the new Railway Production server.
 * This ensures that the unified menu and chat continuity are active even if the 
 * Africa's Talking callback hasn't been updated yet.
 */

header('Content-Type: text/plain');

// 1. The new Production URL on Railway
const PROD_URL = "https://mari-platform-production.up.railway.app/api/ussd";

// 2. Collect all parameters sent by Africa's Talking
$params = [
    'sessionId'   => $_POST['sessionId']   ?? $_GET['sessionId']   ?? '',
    'serviceCode' => $_POST['serviceCode'] ?? $_GET['serviceCode'] ?? '',
    'phoneNumber' => $_POST['phoneNumber'] ?? $_GET['phoneNumber'] ?? '',
    'text'        => $_POST['text']        ?? $_GET['text']        ?? ''
];

// 3. Log the request locally for debugging
$logEntry = date('Y-m-d H:i:s') . " | PROXY | Phone: {$params['phoneNumber']} | Input: '{$params['text']}'\n";
file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);

// 4. Forward to Railway using cURL
$ch = curl_init(PROD_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Increased to 15s for AI stability

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch) || $httpCode >= 400) {
    // Fallback if Railway is unreachable or times out
    echo "CON 🌱 *mARI Platform by Pameltex Tech*\n⚠️ mARI is currently having trouble connecting to AI.\n\n1. Try Again\n0. Menu";
} else {
    // Return the EXACT response from the new unified Node.js server
    echo $response;
}

curl_close($ch);
?>