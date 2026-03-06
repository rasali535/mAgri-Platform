<?php
/**
 * mAgri Platform - Complete USSD Gateway Handler
 * 
 * Mirrors the full website functionality via USSD.
 * Africa's Talking callback URL: https://navajowhite-monkey-252201.hostingersite.com/ussd.php
 * 
 * Navigation: "0" always goes back to the previous menu.
 * Text input paths use Africa's Talking multi-level format: "1*2*3"
 */

header('Content-Type: text/plain');

// Get USSD parameters
$sessionId = isset($_POST['sessionId']) ? $_POST['sessionId'] : (isset($_GET['sessionId']) ? $_GET['sessionId'] : '');
$serviceCode = isset($_POST['serviceCode']) ? $_POST['serviceCode'] : (isset($_GET['serviceCode']) ? $_GET['serviceCode'] : '');
$phoneNumber = isset($_POST['phoneNumber']) ? $_POST['phoneNumber'] : (isset($_GET['phoneNumber']) ? $_GET['phoneNumber'] : '');
$text = isset($_POST['text']) ? $_POST['text'] : (isset($_GET['text']) ? $_GET['text'] : '');

// Fix missing '+' due to URL decoding replacing it with a space
$phoneNumber = str_replace(' ', '+', $phoneNumber);

$phoneNumber = str_replace(' ', '+', $phoneNumber);

// Parse the input levels
$levels = $text === '' ? [] : explode('*', $text);

// Handle "0" (Back to Main Menu) -> Reset processing
$processedLevels = [];
foreach ($levels as $l) {
    if ($l === '0') {
        $processedLevels = []; // Reset to Main Menu on '0'
    } else {
        $processedLevels[] = $l;
    }
}
$levels = $processedLevels;

$depth = count($levels);
$response = '';

// Load user language preferences
$prefs_file = __DIR__ . '/ussd_prefs.json';
$userLang = 'English';
$rawPrefs = '';
if (file_exists($prefs_file)) {
    $rawPrefs = file_get_contents($prefs_file);
    $prefs_data = json_decode($rawPrefs, true);
    if (is_array($prefs_data) && isset($prefs_data[$phoneNumber])) {
        $userLang = $prefs_data[$phoneNumber];
    }
} else {
    $prefs_data = [];
}

// Log
$logEntry = date('Y-m-d H:i:s') . " | Session: $sessionId | Phone: $phoneNumber | Lang: $userLang | Input: '$text' | RAW_JSON: $rawPrefs\n";
file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);


// Define location based on phone number prefix
$locationDisplay = "Lusaka, Zambia";
if (strpos($phoneNumber, '+254') === 0) {
    $locationDisplay = "Nairobi, Kenya";
} elseif (strpos($phoneNumber, '+267') === 0) {
    $locationDisplay = "Gaborone, Botswana";
} elseif (strpos($phoneNumber, '+225') === 0) {
    $locationDisplay = "Abidjan, Côte d'Ivoire";
} elseif (strpos($phoneNumber, '+234') === 0) {
    $locationDisplay = "Lagos, Nigeria";
} elseif (strpos($phoneNumber, '+260') === 0) {
    $locationDisplay = "Lusaka, Zambia";
} elseif (strpos($phoneNumber, '+27') === 0) {
    $locationDisplay = "Pretoria, South Africa";
}

// ========================================
// LEVEL 0 - MAIN MENU
// ========================================
if ($depth === 0) {
    $response = "CON Welcome to mAgri Platform\n";
    $response .= "Brastorne Digital Inclusion\n\n";
    $response .= "1. Home Dashboard\n";
    $response .= "2. AgriMarket\n";
    $response .= "3. Crop Diagnose\n";
    $response .= "4. Ask Agronomist\n";
    $response .= "5. Finance\n";
    $response .= "6. My Account\n";
    $response .= "7. Change Language";
}

// ========================================
// LEVEL 1 - SUB MENUS
// ========================================
elseif ($depth === 1) {

    // --- 1. HOME DASHBOARD ---
    if ($levels[0] === '1') {
        $response = "CON Home Dashboard\n\n";
        $response .= "Local Weather: 28C Partly Cloudy\n";
        $response .= "$locationDisplay\n\n";
        $response .= "1. Check Weather Forecast\n";
        $response .= "2. Recent Activity\n";
        $response .= "3. Quick Crop Scan\n";
        $response .= "4. Quick Market Access\n";
        $response .= "5. Quick Finance Access\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 2. AGRIMARKET ---
    elseif ($levels[0] === '2') {
        $response = "CON AgriMarket\n";
        $response .= "Connect with buyers & sell produce\n\n";
        $response .= "1. Browse Market Listings\n";
        $response .= "2. My Produce Listings\n";
        $response .= "3. Post New Listing\n";
        $response .= "4. Search Produce\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 3. CROP DIAGNOSE ---
    elseif ($levels[0] === '3') {
        $response = "CON Crop Disease Diagnostic\n";
        $response .= "Powered by Tiny-LiteNet AI\n\n";
        $response .= "1. Report Crop Problem\n";
        $response .= "2. Check Diagnosis Status\n";
        $response .= "3. Common Diseases Guide\n";
        $response .= "4. Request Expert Review\n";
        $response .= "5. Use Smartphone Camera\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 4. ASK AGRONOMIST ---
    elseif ($levels[0] === '4') {
        $response = "CON Ask an Agronomist\n";
        $response .= "AgriBot AI Assistant\n\n";
        $response .= "1. Ask About Crops\n";
        $response .= "2. Ask About Weather\n";
        $response .= "3. Ask About Pests\n";
        $response .= "4. Ask About Soil\n";
        $response .= "5. Type Your Question\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 5. FINANCE ---
    elseif ($levels[0] === '5') {
        $response = "CON Finance Services\n\n";
        $response .= "Credit Score: 742 / 850\n";
        $response .= "Status: Eligible for micro-credit\n\n";
        $response .= "1. View Credit Score Details\n";
        $response .= "2. Apply for Micro-Credit\n";
        $response .= "3. Crop Insurance\n";
        $response .= "4. Transaction History\n";
        $response .= "5. USSD Bridge Status\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 6. MY ACCOUNT ---
    elseif ($levels[0] === '6') {
        $response = "CON My Account\n\n";
        $response .= "Phone: $phoneNumber\n";
        $response .= "Role: Farmer\n\n";
        $response .= "1. Update Profile\n";
        $response .= "2. View SMS Messages\n";
        $response .= "3. Help & Support\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 7. CHANGE LANGUAGE ---
    elseif ($levels[0] === '7') {
        $response = "CON Select Language\n\n";
        $response .= "1. English\n";
        $response .= "2. Setswana\n";
        $response .= "3. Bemba\n";
        $response .= "4. Nyanja\n";
        $response .= "5. French\n\n";
        $response .= "0. Back to Main Menu";
    } else {
        $response = "CON Invalid option.\n\n0. Back to Main Menu";
    }
}

// ========================================
// LEVEL 2 - DETAILED SCREENS
// ========================================
elseif ($depth === 2) {

    // --- 1. HOME > Sub-options ---
    if ($levels[0] === '1') {
        if ($levels[1] === '1') {
            // Weather Forecast
            $response = "CON Weather Forecast\n\n";
            $response .= "Today: 28C Partly Cloudy\n";
            $response .= "Tomorrow: 26C Light Rain\n";
            $response .= "Wed: 30C Sunny\n";
            $response .= "Thu: 25C Thunderstorms\n";
            $response .= "Fri: 27C Partly Cloudy\n\n";
            $response .= "Farming Tip: Good conditions for planting this week.\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            // Recent Activity
            $response = "CON Recent Activity\n\n";
            $response .= "1. Maize Leaf Scan - Healthy (Today)\n";
            $response .= "2. Weather Alert - Rain Expected (Yesterday)\n";
            $response .= "3. MoMo Payment - Completed (Oct 12)\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            // Quick Crop Scan -> redirect to Diagnose
            $response = "CON Crop Scan\n\n";
            $response .= "SMS a photo of your crop to:\n";
            $response .= "+254700000000\n\n";
            $response .= "Or describe the problem:\n";
            $response .= "1. Yellowing leaves\n";
            $response .= "2. Brown spots\n";
            $response .= "3. Wilting\n";
            $response .= "4. Pest damage\n";
            $response .= "5. Other (type description)\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '4') {
            // Quick Market -> redirect to Market browse
            $response = "CON Market Quick View\n\n";
            $response .= "Buyers Looking:\n";
            $response .= "- Maize 5 Tons (Lusaka)\n";
            $response .= "- Cashew 1 Ton (Bouake)\n\n";
            $response .= "Sellers:\n";
            $response .= "- Cocoa 200kg (Abidjan)\n";
            $response .= "- Tomatoes 50kg (Ndola)\n\n";
            $response .= "1. Contact a buyer/seller\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '5') {
            // Quick Finance
            $response = "CON Finance Quick View\n\n";
            $response .= "Credit Score: 742/850 (Good)\n";
            $response .= "Eligible: Up to KES 200,000\n\n";
            $response .= "1. Apply Now\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 2. MARKET > Sub-options ---
    elseif ($levels[0] === '2') {
        if ($levels[1] === '1') {
            // Browse Market
            $response = "CON Market Listings\n\n";
            $response .= "1. [BUY] Maize 5 Tons\n";
            $response .= "   Lusaka - AgriCorp\n";
            $response .= "2. [SELL] Cocoa 200kg\n";
            $response .= "   Abidjan - KES 6,000/kg\n";
            $response .= "3. [BUY] Cashew 1 Ton\n";
            $response .= "   Bouake - Export Co.\n";
            $response .= "4. [SELL] Tomatoes 50kg\n";
            $response .= "   Ndola - KES 30,000\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            // My Listings
            $response = "CON My Produce Listings\n\n";
            $response .= "You have no active listings.\n\n";
            $response .= "1. Post a new listing\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            // Post New Listing - Step 1
            $response = "CON Post New Listing\n\n";
            $response .= "What are you selling?\n";
            $response .= "1. Maize\n";
            $response .= "2. Cocoa\n";
            $response .= "3. Cashew Nuts\n";
            $response .= "4. Tomatoes\n";
            $response .= "5. Rice\n";
            $response .= "6. Other (type name)\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '4') {
            // Search Produce
            $response = "CON Search Produce\n\n";
            $response .= "Type the name of produce\n";
            $response .= "you are looking for:\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 3. DIAGNOSE > Sub-options ---
    elseif ($levels[0] === '3') {
        if ($levels[1] === '1') {
            // Report Problem
            $response = "CON Report Crop Problem\n\n";
            $response .= "Which crop is affected?\n";
            $response .= "1. Maize\n";
            $response .= "2. Cocoa\n";
            $response .= "3. Cassava\n";
            $response .= "4. Rice\n";
            $response .= "5. Tomatoes\n";
            $response .= "6. Other (type name)\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            // Check Status
            $response = "CON Diagnosis Status\n\n";
            $response .= "Last Scan: Maize Leaf\n";
            $response .= "Result: Healthy\n";
            $response .= "Confidence: 95%\n";
            $response .= "Date: Today 09:41 AM\n\n";
            $response .= "No pending reviews.\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            // Common Diseases Guide
            $response = "CON Common Crop Diseases\n\n";
            $response .= "1. Fall Armyworm (Maize)\n";
            $response .= "2. Black Pod (Cocoa)\n";
            $response .= "3. Cassava Mosaic\n";
            $response .= "4. Late Blight (Tomato)\n";
            $response .= "5. Rice Blast\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '4') {
            // Request Expert
            $response = "END Expert Review Requested!\n\n";
            $response .= "A human agronomist will contact you via SMS within 24 hours.\n";
            $response .= "Reference: ESC-" . rand(10000, 99999);
            sendSMS($phoneNumber, "mAgri: Your expert review request has been received. An agronomist will contact you within 24 hours. Ref: ESC-" . rand(10000, 99999));
        } elseif ($levels[1] === '5') {
            // Camera Tool
            $response = "CON Smartphone Camera Tool\n\n";
            $response .= "An SMS link has been sent to your phone.\n\n";
            $response .= "Click the link to upload a photo of your crop for instant AI diagnosis.\n\n";
            $response .= "0. Back to Main Menu";
            sendSMS($phoneNumber, "mAgri Camera Tool: Click here to upload a photo for instant AI diagnosis: https://navajowhite-monkey-252201.hostingersite.com");
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 4. ASK AGRONOMIST > Sub-options ---
    elseif ($levels[0] === '4') {
        if ($levels[1] === '1') {
            $response = "CON Crop Advice\n\n";
            $response .= "Best practices for your region:\n";
            $response .= "- Plant maize in Oct-Nov\n";
            $response .= "- Use certified seeds\n";
            $response .= "- Space rows 75cm apart\n";
            $response .= "- Apply fertilizer at 4 weeks\n\n";
            $response .= "1. Get SMS with full guide\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            $response = "CON Weather Advice\n\n";
            $response .= "Current Season: Rainy\n";
            $response .= "Rainfall: Above average\n\n";
            $response .= "Recommendations:\n";
            $response .= "- Ensure good drainage\n";
            $response .= "- Watch for fungal diseases\n";
            $response .= "- Delay fertilizer if heavy rain\n\n";
            $response .= "1. Get SMS weather alerts\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            $response = "CON Pest Management\n\n";
            $response .= "Common pests in your area:\n";
            $response .= "1. Fall Armyworm - Info\n";
            $response .= "2. Aphids - Info\n";
            $response .= "3. Stem Borers - Info\n";
            $response .= "4. Whiteflies - Info\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '4') {
            $response = "CON Soil Health\n\n";
            $response .= "Tips for healthy soil:\n";
            $response .= "- Rotate crops each season\n";
            $response .= "- Add organic compost\n";
            $response .= "- Avoid over-tilling\n";
            $response .= "- Test pH annually\n\n";
            $response .= "1. Get SMS soil guide\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '5') {
            // Type question
            $response = "CON Type your question below:\n\n";
            $response .= "(Type your farming question)\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 5. FINANCE > Sub-options ---
    elseif ($levels[0] === '5') {
        if ($levels[1] === '1') {
            // Credit Score Details
            $response = "CON Credit Score Details\n\n";
            $response .= "Score: 742 / 850\n";
            $response .= "Rating: Good\n\n";
            $response .= "Based on:\n";
            $response .= "- Yield History: 85%\n";
            $response .= "- Platform Usage: 90%\n";
            $response .= "- Repayment History: 95%\n\n";
            $response .= "Eligible for micro-credit\n";
            $response .= "up to KES 200,000\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            // Apply Micro-Credit
            $response = "CON Mobile Money Micro-Credit\n\n";
            $response .= "Select loan amount:\n";
            $response .= "1. KES 5,000\n";
            $response .= "2. KES 10,000\n";
            $response .= "3. KES 25,000\n";
            $response .= "4. KES 50,000\n";
            $response .= "5. KES 100,000\n\n";
            $response .= "Interest: 4.5%/month\n";
            $response .= "Duration: 3 months\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            // Crop Insurance
            $response = "CON Crop Insurance\n\n";
            $response .= "Protect your yield against\n";
            $response .= "drought and pests.\n\n";
            $response .= "Select farm size:\n";
            $response .= "1. 1 Acre  - KES 2,500\n";
            $response .= "2. 2 Acres - KES 5,000\n";
            $response .= "3. 5 Acres - KES 12,500\n";
            $response .= "4. 10 Acres - KES 25,000\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '4') {
            // Transaction History
            $response = "CON Transaction History\n\n";
            $response .= "1. MoMo Payment KES 5,000\n";
            $response .= "   Oct 12 - Completed\n";
            $response .= "2. Crop Insurance KES 2,500\n";
            $response .= "   Oct 5 - Active\n";
            $response .= "3. Market Sale KES 15,000\n";
            $response .= "   Sep 28 - Completed\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '5') {
            // USSD Bridge Status
            $response = "CON USSD Bridge Status\n\n";
            $response .= "Status: ACTIVE\n";
            $response .= "Data Synced: Yes\n";
            $response .= "Last Sync: Just now\n\n";
            $response .= "Your data is synced between\n";
            $response .= "the web app and USSD.\n";
            $response .= "Dial *384*14032# anytime.\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 6. ACCOUNT > Sub-options ---
    elseif ($levels[0] === '6') {
        if ($levels[1] === '1') {
            $response = "CON Update Profile\n\n";
            $response .= "1. Update Name\n";
            $response .= "2. Update Location\n";
            $response .= "3. Update Farm Size\n";
            $response .= "4. Update Crops Grown\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '2') {
            $response = "CON SMS Messages\n\n";
            $response .= "1. Buyer: Interested in\n";
            $response .= "   500kg Maize (NEW)\n";
            $response .= "2. mAgri: Weather alert\n";
            $response .= "   rain expected tomorrow\n";
            $response .= "3. Expert: Your cocoa looks\n";
            $response .= "   healthy, continue care\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[1] === '3') {
            $response = "CON Help & Support\n\n";
            $response .= "1. How to use USSD\n";
            $response .= "2. Contact Support\n";
            $response .= "3. Report a Problem\n";
            $response .= "4. About mAgri Platform\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }
    // --- 7. CHANGE LANGUAGE ---
    elseif ($levels[0] === '7') {
        $langs = ['1' => 'English', '2' => 'Setswana', '3' => 'Bemba', '4' => 'Nyanja', '5' => 'French'];
        if (isset($langs[$levels[1]])) {
            $newLang = $langs[$levels[1]];

            // Save preference locally
            global $prefs_data, $prefs_file, $phoneNumber;
            $prefs_data[$phoneNumber] = $newLang;
            file_put_contents($prefs_file, json_encode($prefs_data));

            $response = "CON Language changed to $newLang!\n\nYour menus and AI Chat will now use $newLang.\n\n0. Back to Main Menu";
            sendSMS($phoneNumber, "mAgri: Your language has been updated to $newLang.");
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    } else {
        $response = "CON Invalid option.\n\n0. Back to Main Menu";
    }
}

// ========================================
// LEVEL 3 - DEEP SCREENS (Actions & Confirmations)
// ========================================
elseif ($depth === 3) {

    // --- 1.3.X - Home > Crop Scan > Symptoms ---
    if ($levels[0] === '1' && $levels[1] === '3') {
        $symptoms = [
            '1' => 'Yellowing Leaves',
            '2' => 'Brown Spots',
            '3' => 'Wilting',
            '4' => 'Pest Damage'
        ];
        if (isset($symptoms[$levels[2]])) {
            $response = "END Crop Scan Submitted!\n\n";
            $response .= "Symptom: {$symptoms[$levels[2]]}\n";
            $response .= "An AI analysis will be sent via SMS.\n\n";
            $response .= "Ref: SCAN-" . rand(10000, 99999);
            sendSMS($phoneNumber, "mAgri Crop Scan: Your report for '{$symptoms[$levels[2]]}' has been received. AI analysis in progress. You will receive results via SMS.");
        } else {
            $response = "CON Please describe the problem:\n(Type your description)\n\n0. Back to Main Menu";
        }
    }

    // --- 2.1.X - Market > Browse > Contact ---
    elseif ($levels[0] === '2' && $levels[1] === '1') {
        $listings = [
            '1' => ['Maize 5 Tons', 'AgriCorp Buyers', 'Lusaka'],
            '2' => ['Cocoa 200kg', 'Kouame', 'Abidjan'],
            '3' => ['Cashew 1 Ton', 'Export Co.', 'Bouake'],
            '4' => ['Tomatoes 50kg', 'Grace', 'Ndola']
        ];
        if (isset($listings[$levels[2]])) {
            $l = $listings[$levels[2]];
            $response = "CON {$l[0]}\n";
            $response .= "Seller: {$l[1]}\n";
            $response .= "Location: {$l[2]}\n\n";
            $response .= "1. Send SMS to {$l[1]}\n";
            $response .= "2. Express Interest\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid selection.\n\n0. Back to Main Menu";
        }
    }

    // --- 2.3.X - Market > Post Listing > Select Produce ---
    elseif ($levels[0] === '2' && $levels[1] === '3') {
        $produces = ['1' => 'Maize', '2' => 'Cocoa', '3' => 'Cashew Nuts', '4' => 'Tomatoes', '5' => 'Rice'];
        $name = isset($produces[$levels[2]]) ? $produces[$levels[2]] : $levels[2];
        $response = "CON Selling: $name\n\n";
        $response .= "Enter quantity (e.g. 50kg):\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 2.4.X - Market > Search Result ---
    elseif ($levels[0] === '2' && $levels[1] === '4') {
        $search = $levels[2];
        $response = "CON Search Results for '$search':\n\n";
        $response .= "1. [SELL] $search 100kg - Lusaka\n";
        $response .= "2. [BUY] $search 50kg - Ndola\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 3.1.X - Diagnose > Report > Select Crop ---
    elseif ($levels[0] === '3' && $levels[1] === '1') {
        $crops = ['1' => 'Maize', '2' => 'Cocoa', '3' => 'Cassava', '4' => 'Rice', '5' => 'Tomatoes'];
        $crop = isset($crops[$levels[2]]) ? $crops[$levels[2]] : $levels[2];
        $response = "CON Diagnosing: $crop\n\n";
        $response .= "What symptoms do you see?\n";
        $response .= "1. Yellowing leaves\n";
        $response .= "2. Brown/black spots\n";
        $response .= "3. Wilting/drooping\n";
        $response .= "4. Holes in leaves\n";
        $response .= "5. White powder/mold\n";
        $response .= "6. Other (type it)\n\n";
        $response .= "0. Back to Main Menu";
    }

    // --- 3.3.X - Common Diseases > Detail ---
    elseif ($levels[0] === '3' && $levels[1] === '3') {
        $diseases = [
            '1' => ['Fall Armyworm', 'Affects maize. Look for holes in leaves and frass. Use Bt-based pesticides. Apply early morning.'],
            '2' => ['Black Pod Disease', 'Affects cocoa. Dark brown/black lesions on pods. Remove infected pods immediately. Apply copper fungicide.'],
            '3' => ['Cassava Mosaic', 'Yellow-green patterns on leaves. Use disease-free cuttings. Remove infected plants.'],
            '4' => ['Late Blight', 'Affects tomatoes. Brown spots on leaves. Improve air circulation. Apply fungicide preventively.'],
            '5' => ['Rice Blast', 'Gray-green lesions on leaves. Use resistant varieties. Apply nitrogen carefully.']
        ];
        if (isset($diseases[$levels[2]])) {
            $d = $diseases[$levels[2]];
            $response = "CON {$d[0]}\n\n";
            $response .= "{$d[1]}\n\n";
            $response .= "1. Get full guide via SMS\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 4.1-4.4 > Get SMS guides ---
    elseif ($levels[0] === '4' && in_array($levels[1], ['1', '2', '3', '4'])) {
        $topics = ['1' => 'Crop', '2' => 'Weather', '3' => 'Pest', '4' => 'Soil'];
        if ($levels[2] === '1') {
            $topic = $topics[$levels[1]];
            $response = "END $topic guide sent to your phone via SMS!";
            sendSMS($phoneNumber, "mAgri $topic Guide: Detailed information has been sent. Visit our web app for more: navajowhite-monkey-252201.hostingersite.com");
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 4.3.X - Pest Info Detail ---
    elseif ($levels[0] === '4' && $levels[1] === '3') {
        $pests = [
            '1' => ['Fall Armyworm', 'Damages maize crops. Use early detection. Apply Bt-spray at first signs. Scout fields weekly.'],
            '2' => ['Aphids', 'Small green/black insects. Use neem spray. Encourage ladybugs. Remove heavily infested leaves.'],
            '3' => ['Stem Borers', 'Bore into stems. Use push-pull technique. Plant Desmodium alongside crops.'],
            '4' => ['Whiteflies', 'Tiny white flying insects. Use yellow sticky traps. Apply neem oil. Avoid over-watering.']
        ];
        if (isset($pests[$levels[2]])) {
            $p = $pests[$levels[2]];
            $response = "CON {$p[0]}\n\n";
            $response .= "{$p[1]}\n\n";
            $response .= "1. Get full guide via SMS\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 4.5.X - Custom Question ---
    elseif ($levels[0] === '4' && $levels[1] === '5') {
        $question = $levels[2];
        global $userLang;
        $aiAnswer = callOpenAI("User asked: " . $question, $userLang);
        $response = "CON AI Agronomist:\n\n$aiAnswer\n\n0. Back to Main Menu";
        sendSMS($phoneNumber, "mAgri AI Response: $aiAnswer");
    }

    // --- 5.2.X - Finance > Micro-Credit > Select Amount ---
    elseif ($levels[0] === '5' && $levels[1] === '2') {
        $amounts = ['1' => 5000, '2' => 10000, '3' => 25000, '4' => 50000, '5' => 100000];
        if (isset($amounts[$levels[2]])) {
            $amt = $amounts[$levels[2]];
            $repay = number_format($amt * 1.135);
            $response = "CON Confirm Micro-Credit\n\n";
            $response .= "Amount: KES " . number_format($amt) . "\n";
            $response .= "Interest: 4.5%/month\n";
            $response .= "Duration: 3 months\n";
            $response .= "Total Repayment: KES $repay\n\n";
            $response .= "1. Confirm & Disburse\n";
            $response .= "2. Cancel\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid amount.\n\n0. Back to Main Menu";
        }
    }

    // --- 5.3.X - Finance > Insurance > Select Acres ---
    elseif ($levels[0] === '5' && $levels[1] === '3') {
        $options = ['1' => [1, 2500, 50000], '2' => [2, 5000, 100000], '3' => [5, 12500, 250000], '4' => [10, 25000, 500000]];
        if (isset($options[$levels[2]])) {
            $o = $options[$levels[2]];
            $response = "CON Confirm Crop Insurance\n\n";
            $response .= "Farm Size: {$o[0]} Acre(s)\n";
            $response .= "Premium: KES " . number_format($o[1]) . "\n";
            $response .= "Coverage: KES " . number_format($o[2]) . "\n";
            $response .= "Payment: Mobile Money\n\n";
            $response .= "1. Pay & Insure\n";
            $response .= "2. Cancel\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    }

    // --- 6.2.X - View SMS Message Detail ---
    elseif ($levels[0] === '6' && $levels[1] === '2') {
        $msgs = [
            '1' => "Buyer Message:\n\"Interested in 500kg Maize.\nCan offer KES 45/kg.\nContact: +254700123456\"\n\n1. Reply to buyer",
            '2' => "Weather Alert:\nHeavy rain expected tomorrow.\nSecure harvested crops.\nEnsure drainage is clear.",
            '3' => "Expert Agronomist:\nYour cocoa crop looks healthy.\nContinue regular care.\nNext inspection in 2 weeks."
        ];
        if (isset($msgs[$levels[2]])) {
            $response = "CON " . $msgs[$levels[2]] . "\n\n0. Back to Main Menu";
        } else {
            $response = "CON Invalid message.\n\n0. Back to Main Menu";
        }
    }

    // --- 6.3.X - Help Sub-options ---
    elseif ($levels[0] === '6' && $levels[1] === '3') {
        if ($levels[2] === '1') {
            $response = "CON How to Use USSD\n\n";
            $response .= "Dial *384*14032# to access.\n";
            $response .= "Press numbers to navigate.\n";
            $response .= "Press 0 to go back.\n";
            $response .= "Your data syncs with the\n";
            $response .= "web app automatically.\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[2] === '2') {
            $response = "END Contact Support\n\nCall: +254 700 000 000\nSMS: HELP to 14032\nEmail: support@magri.com";
        } elseif ($levels[2] === '3') {
            $response = "CON Report a Problem\n\n";
            $response .= "Type your issue below:\n\n";
            $response .= "0. Back to Main Menu";
        } elseif ($levels[2] === '4') {
            $response = "CON About mAgri Platform\n\n";
            $response .= "Brastorne Digital Inclusion\n";
            $response .= "mAgri v1.0\n\n";
            $response .= "AI-powered agriculture\n";
            $response .= "platform for African farmers.\n";
            $response .= "Web + USSD + SMS integrated.\n\n";
            $response .= "0. Back to Main Menu";
        } else {
            $response = "CON Invalid option.\n\n0. Back to Main Menu";
        }
    } else {
        $response = "CON Invalid option.\n\n0. Back to Main Menu";
    }
}

// ========================================
// LEVEL 4 - FINAL ACTIONS & CONFIRMATIONS
// ========================================
elseif ($depth === 4) {

    // --- 1.3.5.X - Crop Scan > Other > Type description ---
    if ($levels[0] === '1' && $levels[1] === '3' && $levels[2] === '5') {
        $description = $levels[3];
        global $userLang;
        $aiAnswer = callOpenAI("User described crop problem: '$description'. Provide short diagnosis.", $userLang);

        $response = "CON Crop AI Diagnosis:\n\n$aiAnswer\n\n0. Back to Main Menu";
        sendSMS($phoneNumber, "mAgri Crop AI: $aiAnswer");
    }

    // --- 2.1.X.1 - Market > Listing > Contact Seller ---
    elseif ($levels[0] === '2' && $levels[1] === '1' && ($levels[3] === '1' || $levels[3] === '2')) {
        $listings = ['1' => 'AgriCorp', '2' => 'Kouame', '3' => 'Export Co.', '4' => 'Grace'];
        $seller = isset($listings[$levels[2]]) ? $listings[$levels[2]] : 'Seller';
        if ($levels[3] === '1') {
            $response = "CON SMS sent to $seller!\n\nThey will contact you shortly.\nRef: MKT-" . rand(10000, 99999) . "\n\n0. Back to Main Menu";
            sendSMS($phoneNumber, "mAgri Market: Your interest has been sent to $seller. They will contact you shortly.");
        } else {
            $response = "CON Interest expressed to $seller!\n\nYou will receive their response via SMS.\nRef: MKT-" . rand(10000, 99999) . "\n\n0. Back to Main Menu";
            sendSMS($phoneNumber, "mAgri Market: You expressed interest. $seller will be notified.");
        }
    }

    // --- 2.3.X.qty - Market > Post Listing > Quantity ---
    elseif ($levels[0] === '2' && $levels[1] === '3') {
        $produces = ['1' => 'Maize', '2' => 'Cocoa', '3' => 'Cashew Nuts', '4' => 'Tomatoes', '5' => 'Rice'];
        $name = isset($produces[$levels[2]]) ? $produces[$levels[2]] : $levels[2];
        $qty = $levels[3];
        $response = "CON Listing Posted!\n\n";
        $response .= "Produce: $name\n";
        $response .= "Quantity: $qty\n";
        $response .= "Status: Live on AgriMarket\n\n";
        $response .= "Buyers will contact you via SMS.\n\n";
        $response .= "0. Back to Main Menu";
        sendSMS($phoneNumber, "mAgri Market: Your listing for $name ($qty) is now live! Buyers will contact you via SMS.");
    }

    // --- 3.1.X.Y - Diagnose > Crop > Symptom ---
    elseif ($levels[0] === '3' && $levels[1] === '1') {
        $crops = ['1' => 'Maize', '2' => 'Cocoa', '3' => 'Cassava', '4' => 'Rice', '5' => 'Tomatoes'];
        $symptoms = ['1' => 'Yellowing leaves', '2' => 'Brown/black spots', '3' => 'Wilting', '4' => 'Holes in leaves', '5' => 'White powder/mold'];
        $crop = isset($crops[$levels[2]]) ? $crops[$levels[2]] : $levels[2];
        $symptom = isset($symptoms[$levels[3]]) ? $symptoms[$levels[3]] : $levels[3];

        global $userLang;
        $aiPrompt = "User reported crop problem. Crop: $crop, Symptom: $symptom. Provide short diagnosis.";
        $aiAnswer = callOpenAI($aiPrompt, $userLang);

        $response = "CON Diagnosis Result:\n\nCrop: $crop\nAI: $aiAnswer\n\n0. Back to Main Menu";
        sendSMS($phoneNumber, "mAgri Diagnosis ($crop): $aiAnswer");
    }

    // --- 3.3.X.1 - Disease > Get SMS Guide ---
    elseif ($levels[0] === '3' && $levels[1] === '3' && $levels[3] === '1') {
        $diseases = ['1' => 'Fall Armyworm', '2' => 'Black Pod Disease', '3' => 'Cassava Mosaic', '4' => 'Late Blight', '5' => 'Rice Blast'];
        $name = isset($diseases[$levels[2]]) ? $diseases[$levels[2]] : 'Disease';
        $response = "END Full guide for $name sent to your phone via SMS!";
        sendSMS($phoneNumber, "mAgri Disease Guide: $name - Full treatment guide. Use recommended pesticides. Monitor regularly. Visit web app for photos and detailed steps.");
    }

    // --- 5.2.X.1 - Finance > Credit > Confirm ---
    elseif ($levels[0] === '5' && $levels[1] === '2') {
        $amounts = ['1' => 5000, '2' => 10000, '3' => 25000, '4' => 50000, '5' => 100000];
        $amt = isset($amounts[$levels[2]]) ? $amounts[$levels[2]] : 0;
        if ($levels[3] === '1') {
            $txnId = "MM-TXN-" . rand(100000, 999999);
            $response = "END Funds Disbursed!\n\n";
            $response .= "KES " . number_format($amt) . " sent to\n";
            $response .= "your Mobile Money wallet.\n\n";
            $response .= "Transaction: $txnId\n";
            $response .= "Repay in 3 months.";
            sendSMS($phoneNumber, "mAgri Finance: KES " . number_format($amt) . " has been disbursed to your wallet. TXN: $txnId. Repay within 3 months.");
        } else {
            $response = "END Application cancelled.\n\nNo changes made to your account.";
        }
    }

    // --- 5.3.X.1 - Finance > Insurance > Confirm ---
    elseif ($levels[0] === '5' && $levels[1] === '3') {
        $options = ['1' => [1, 2500], '2' => [2, 5000], '3' => [5, 12500], '4' => [10, 25000]];
        $o = isset($options[$levels[2]]) ? $options[$levels[2]] : [0, 0];
        if ($levels[3] === '1') {
            $policyId = "MM-INS-" . rand(100000, 999999);
            $response = "END Crop Insured!\n\n";
            $response .= "{$o[0]} acre(s) of maize\n";
            $response .= "now protected for the season.\n\n";
            $response .= "Policy: $policyId\n";
            $response .= "Premium: KES " . number_format($o[1]);
            sendSMS($phoneNumber, "mAgri Insurance: Your {$o[0]} acre(s) are now insured! Policy: $policyId. Premium: KES " . number_format($o[1]) . " deducted.");
        } else {
            $response = "END Insurance application cancelled.\n\nNo payment was made.";
        }
    }

    // --- 6.2.1.reply - Reply to buyer ---
    elseif ($levels[0] === '6' && $levels[1] === '2' && $levels[2] === '1' && $levels[3] === '1') {
        $response = "CON Reply to Buyer\n\n";
        $response .= "Type your reply message:\n\n0. Back to Main Menu";
    } else {
        $response = "END Thank you for using mAgri Platform!\n\nDial *384*14032# again anytime.";
    }
}

// ========================================
// LEVEL 5+ - DEEP FINAL ACTIONS
// ========================================
elseif ($depth >= 5) {

    // --- 6.2.1.1.X - Buyer Reply Message ---
    if ($levels[0] === '6' && $levels[1] === '2' && $levels[2] === '1' && $levels[3] === '1') {
        $reply = $levels[4];
        $response = "CON Reply sent to buyer!\n\n\"$reply\"\n\nThey will receive your message via SMS.\n\n0. Back to Main Menu";
        sendSMS($phoneNumber, "mAgri Market: Your reply has been sent to the buyer. They will respond via SMS.");
    }

    // --- 6.3.3.X - Report Problem Text ---
    elseif ($levels[0] === '6' && $levels[1] === '3' && $levels[2] === '3') {
        $issue = $levels[3];
        $response = "END Problem reported!\n\n\"$issue\"\n\nOur support team will contact you within 24 hours.\nRef: SUP-" . rand(10000, 99999);
        sendSMS($phoneNumber, "mAgri Support: Your issue has been reported. Our team will contact you within 24 hours.");
    } else {
        $response = "END Thank you for using mAgri Platform!\n\nDial *384*14032# again anytime.";
    }
} else {
    $response = "END Thank you for using mAgri Platform!\n\nDial *384*14032# again anytime.";
}

if ($userLang !== 'English') {
    $response = translateMenu($response, $userLang);
}

echo $response;

// ========================================
// OpenAI Key Helper
// ========================================
function getOpenAIKey()
{
    $apiKey = getenv('VITE_OPENAI_API_KEY') ?: getenv('OPENAI_API_KEY');
    if ($apiKey)
        return $apiKey;

    // Check .env file
    $env_path = __DIR__ . '/../.env';
    if (!file_exists($env_path)) {
        $env_path = __DIR__ . '/.env'; // fallback
    }

    if (file_exists($env_path)) {
        $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, 'VITE_OPENAI_API_KEY=') === 0 || strpos($line, 'OPENAI_API_KEY=') === 0) {
                $val = explode('=', $line, 2)[1];
                return trim(str_replace(['"', "'"], '', $val));
            }
        }
    }
    return "";
}

// ========================================
// Menu Translation Function
// ========================================
function translateMenu($text, $language)
{
    $apiKey = getOpenAIKey();

    if (!$apiKey) {
        // Log that translation was skipped due to missing API key
        $logMsg = date('Y-m-d H:i:s') . " | TRANSLATE WARNING: No API Key found, skipping translation to $language\n";
        file_put_contents(__DIR__ . '/ussd_log.txt', $logMsg, FILE_APPEND);
        return $text;
    }

    $messages = [
        [
            "role" => "system",
            "content" => "You are a strict translator for a USSD menu. Translate the target string exactly into $language. Keep all structural formats, line breaks, 'CON' or 'END' prefixes, and option numbers completely intact. Do not add any conversational filler."
        ],
        [
            "role" => "user",
            "content" => $text
        ]
    ];

    $data = [
        "model" => "gpt-4o-mini",
        "messages" => $messages,
        "max_tokens" => 250,
        "temperature" => 0.2
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $apiResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $logMsg = date('Y-m-d H:i:s') . " | TRANSLATE to $language | HTTP $httpCode | Err: $curlError | Resp: $apiResponse\n";
    file_put_contents(__DIR__ . '/ussd_log.txt', $logMsg, FILE_APPEND);

    if ($apiResponse) {
        $json = json_decode($apiResponse, true);
        if (isset($json['choices'][0]['message']['content'])) {
            return trim($json['choices'][0]['message']['content']);
        }
    }
    return $text;
}

// ========================================
// SMS Helper Function
// ========================================
function sendSMS($to, $message)
{
    $username = getenv('AT_USERNAME') ?: 'sandbox';
    $apiKey = getenv('AT_API_KEY');

    if (!$apiKey) {
        $logEntry = date('Y-m-d H:i:s') . " | [SMS to $to]: $message\n";
        file_put_contents(__DIR__ . '/ussd_log.txt', $logEntry, FILE_APPEND);
        return;
    }

    $url = 'https://api.africastalking.com/version1/messaging';
    $data = array('username' => $username, 'to' => $to, 'message' => $message);

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

// ========================================
// OpenAI Helper Function
// ========================================
function callOpenAI($prompt, $language)
{
    $apiKey = getOpenAIKey();

    if (!$apiKey)
        return "AI is currently unavailable.";

    $data = [
        "model" => "gpt-4o-mini",
        "messages" => [
            [
                "role" => "system",
                "content" => "You are an expert agronomist for mAgri Platform. Keep your response very short, extremely concise (under 120 characters to fit in an SMS), and very helpful. IMPORTANT: Reply entirely in the language: $language."
            ],
            [
                "role" => "user",
                "content" => $prompt
            ]
        ],
        "max_tokens" => 60,
        "temperature" => 0.7
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6); // Set reasonable timeout

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $json = json_decode($response, true);
        if (isset($json['choices'][0]['message']['content'])) {
            return trim($json['choices'][0]['message']['content']);
        }
    }
    return "Sorry, we could not get an AI analysis right now in $language.";
}
?>