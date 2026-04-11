/**
 * scratch/verify_services.js
 * Verification script for Vuka, Mpotsa, and Payment services.
 */
import 'dotenv/config';
import { VukaService } from './services/vuka.js';
import { MpotsaService } from './services/mpotsa.js';
import { PaymentService } from './services/payment.js';
import { USSDService } from './services/ussd.js';

async function runTests() {
    console.log('--- STARTING VERIFICATION ---');

    const testMsisdn = '26771234567';
    const testFriend = '26772233445';

    // 1. Vuka Profile
    console.log('\n[1] Testing Vuka Profile...');
    await VukaService.registerUser(testMsisdn, 'Test User');
    const user = await VukaService.getUser(testMsisdn);
    console.log('User created:', user?.name === 'Test User' ? '✅' : '❌');

    // 2. Friends (Bidirectional)
    console.log('\n[2] Testing Vuka Friends...');
    await VukaService.addFriend(testMsisdn, testFriend);
    const friendsOfA = await VukaService.getFriends(testMsisdn);
    const friendsOfB = await VukaService.getFriends(testFriend);
    console.log('A has B:', friendsOfA.some(f => f.friend_msisdn === testFriend) ? '✅' : '❌');
    console.log('B has A:', friendsOfB.some(f => f.friend_msisdn === testMsisdn) ? '✅' : '❌');

    // 3. Mpotsa Search
    console.log('\n[3] Testing Mpotsa Engine...');
    const res = await MpotsaService.search('pregnancy tips', testMsisdn);
    console.log('Mpotsa Result:', res.text.includes('balanced diet') ? '✅' : '❌');

    // 4. Payment Initiation
    console.log('\n[4] Testing Orange Money Initiation...');
    const payRes = await PaymentService.initiatePayment(testMsisdn, 20, 'MONTHLY');
    console.log('PayToken received:', payRes.payToken ? '✅' : '❌');

    // 5. OTP Validation & Subscription
    console.log('\n[5] Testing OTP Validation...');
    const valRes = await PaymentService.validateOTP(testMsisdn, payRes.payToken, '123456', 'MONTHLY');
    const sub = PaymentService.checkSubscription(testMsisdn);
    console.log('Validation success:', valRes.success ? '✅' : '❌');
    console.log('Subscription active:', sub.active ? '✅' : '❌');

    // 6. USSD State Machine
    console.log('\n[6] Testing USSD State Machine...');
    await USSDService.handleRequest(testMsisdn, '8*4'); // Go to Relay Recipient state
    const state = USSDService.getState(testMsisdn);
    console.log('State is RELAY_RECIPIENT:', state.state === 'VUKA_RELAY_RECIPIENT' ? '✅' : '❌');

    console.log('\n--- VERIFICATION COMPLETE ---');
    process.exit(0);
}

runTests().catch((e) => {
    console.error(e);
    process.exit(1);
});
