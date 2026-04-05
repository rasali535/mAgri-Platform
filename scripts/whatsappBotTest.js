/**
 * scripts/whatsappBotTest.js
 * Simulates a WhatsApp conversation flow entirely in-process (no real network calls).
 * Run with: node scripts/whatsappBotTest.js
 */

import 'dotenv/config';
import { processMessage } from '../whatsapp/bot.js';
import { resetSession } from '../whatsapp/supabaseStore.js';

const TEST_PHONE = '+254712000000';

async function chat(text) {
  const reply = await processMessage(TEST_PHONE, text);
  console.log(`\n📱 User → "${text}"`);
  console.log(`🤖 Bot  → \n${reply}`);
  console.log('─'.repeat(60));
  return reply;
}

async function run() {
  console.log('═'.repeat(60));
  console.log('  mARI WhatsApp Bot – Conversation Simulation');
  console.log('═'.repeat(60));

  // Start fresh
  await resetSession(TEST_PHONE);

  // 1. Welcome
  await chat('hello');

  // 2. Navigate to Marketplace → search for Maize
  await chat('2');
  await chat('Maize');

  // 3. Back to menu → Weather
  await chat('MENU');
  await chat('8');

  // 4. Back to menu → Credit Score
  await chat('MENU');
  await chat('5');
  await chat('1');

  // 5. Back to menu → Apply for credit
  await chat('MENU');
  await chat('5');
  await chat('2');
  await chat('5000');

  // 6. Link account
  await chat('LINK');
  await chat('farmer@example.com');

  // 7. Open web app link
  await chat('MENU');
  await chat('7');

  // 8. Ask agronomist
  await chat('MENU');
  await chat('4');
  await chat('What fertilizer should I use for maize in clay soil?');

  console.log('\n✅ Simulation complete!');
}

run().catch(console.error);
