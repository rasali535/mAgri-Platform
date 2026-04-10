/**
 * tests/whatsappBot.test.js
 *
 * Jest unit tests for the WhatsApp conversational bot.
 * Tests the FSM logic in whatsapp/bot.js by mocking the session store
 * and asserting the correct reply text for each state transition.
 *
 * Run with:  npx jest tests/whatsappBot.test.js
 * (Install Jest first if needed: npm i -D jest)
 */

import { jest } from '@jest/globals';

// ─── Mock the session store so tests run without a real DB ───────────────────
const mockSessions = new Map();

jest.unstable_mockModule('../whatsapp/sessions.js', () => ({
  getSession: (phone) => {
    if (!mockSessions.has(phone)) {
      mockSessions.set(phone, { phone, state: 'WELCOME', linked: false, email: null, history: [] });
    }
    return mockSessions.get(phone);
  },
  updateSession: (phone, patch) => {
    const s = mockSessions.get(phone) || { phone, state: 'WELCOME', linked: false, email: null, history: [] };
    mockSessions.set(phone, { ...s, ...patch });
  },
  resetSession: (phone) => {
    mockSessions.set(phone, { phone, state: 'WELCOME', linked: false, email: null, history: [] });
  },
}));

// Dynamically import bot AFTER mocks are set up
const { processMessage } = await import('../whatsapp/bot.js');

const PHONE = '+254700000000';

function resetAll() {
  mockSessions.clear();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('mARI WhatsApp Bot FSM', () => {
  beforeEach(resetAll);

  // Welcome / global commands
  describe('Welcome state', () => {
    test('HELLO triggers welcome menu', async () => {
      const reply = await processMessage(PHONE, 'hello');
      expect(reply).toContain('Welcome to mARI Platform by Pameltex Tech');
      expect(reply).toContain('1️⃣');
      expect(reply).toContain('Marketplace');
    });

    test('START triggers welcome menu', async () => {
      const reply = await processMessage(PHONE, 'START');
      expect(reply).toContain('Welcome to mARI Platform by Pameltex Tech');
    });

    test('MENU returns to welcome from any state', async () => {
      // Simulate being in MARKETPLACE state
      mockSessions.set(PHONE, { phone: PHONE, state: 'MARKETPLACE', linked: false, email: null, history: [] });
      const reply = await processMessage(PHONE, 'MENU');
      expect(reply).toContain('Welcome to mARI Platform by Pameltex Tech');
    });

    test('Unknown input in WELCOME returns unknown message', async () => {
      await processMessage(PHONE, 'hello'); // init session
      const reply = await processMessage(PHONE, '99');
      expect(reply).toContain("didn't understand");
    });
  });

  // Marketplace
  describe('Marketplace (option 1)', () => {
    test('Option 1 shows marketplace menu', async () => {
      await processMessage(PHONE, 'hello');
      const reply = await processMessage(PHONE, '1');
      expect(reply).toContain('AgriMarket');
      expect(reply).toContain('crop name');
    });

    test('Search for Maize returns results', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '1');
      const reply = await processMessage(PHONE, 'Maize');
      expect(reply).toContain('Maize');
    });

    test('ALL shows multiple listings', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '1');
      const reply = await processMessage(PHONE, 'ALL');
      expect(reply).toContain('Cocoa');
      expect(reply).toContain('Maize');
    });

    test('0 in MARKETPLACE returns to welcome', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '1');
      const reply = await processMessage(PHONE, '0');
      expect(reply).toContain('Welcome to mARI Platform by Pameltex Tech');
    });
  });

  // Weather
  describe('Weather (option 4)', () => {
    test('Option 4 shows weather forecast', async () => {
      await processMessage(PHONE, 'hello');
      const reply = await processMessage(PHONE, '4');
      expect(reply).toContain('Weather Forecast');
      expect(reply).toContain('°C');
    });
  });

  // Credit
  describe('Credit menu (option 3)', () => {
    test('Option 3 shows credit menu', async () => {
      await processMessage(PHONE, 'hello');
      const reply = await processMessage(PHONE, '3');
      expect(reply).toContain('Credit & Finance');
      expect(reply).toContain('Credit Score');
    });

    test('Option 1 in credit shows score', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '3');
      const reply = await processMessage(PHONE, '1');
      expect(reply).toContain('745');
      expect(reply).toContain('Excellent');
    });

    test('Option 2 in credit prompts for amount', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '3');
      const reply = await processMessage(PHONE, '2');
      expect(reply).toContain('credit are you applying for');
    });

    test('Valid amount confirms credit application', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '3');
      await processMessage(PHONE, '2');
      const reply = await processMessage(PHONE, '5000');
      expect(reply).toContain('5000');
      expect(reply).toContain('received');
    });

    test('Invalid amount prompts again', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '3');
      await processMessage(PHONE, '2');
      const reply = await processMessage(PHONE, 'not a number');
      expect(reply).toContain('valid numeric amount');
    });
  });

  // Agronomist
  describe('Agronomist (option 5)', () => {
    test('Option 5 prompts for question', async () => {
      await processMessage(PHONE, 'hello');
      const reply = await processMessage(PHONE, '5');
      expect(reply).toContain('Agronomist');
    });

    test('Valid question is acknowledged', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '5');
      const reply = await processMessage(PHONE, 'What fertilizer for maize in clay soil?');
      expect(reply).toContain('sent to our expert');
    });

    test('Short question is rejected', async () => {
      await processMessage(PHONE, 'hello');
      await processMessage(PHONE, '5');
      const reply = await processMessage(PHONE, 'hi');
      expect(reply).toContain('too short');
    });
  });

  // Account linking
  describe('Account linking (LINK)', () => {
    test('LINK command prompts for email', async () => {
      const reply = await processMessage(PHONE, 'LINK');
      expect(reply).toContain('email address');
    });

    test('Valid email links the account', async () => {
      await processMessage(PHONE, 'LINK');
      const reply = await processMessage(PHONE, 'farmer@example.com');
      expect(reply).toContain('linked to');
      expect(reply).toContain('farmer@example.com');
    });

    test('Invalid email is rejected', async () => {
      await processMessage(PHONE, 'LINK');
      const reply = await processMessage(PHONE, 'notanemail');
      expect(reply).toContain("doesn't look like a valid email");
    });

    test('After linking, welcome menu has no warning', async () => {
      await processMessage(PHONE, 'LINK');
      await processMessage(PHONE, 'farmer@example.com');
      const reply = await processMessage(PHONE, 'MENU');
      expect(reply).not.toContain('not linked yet');
    });
  });

  // CANCEL
  describe('CANCEL global command', () => {
    test('CANCEL from AWAIT_LINK returns to welcome', async () => {
      await processMessage(PHONE, 'LINK');
      const reply = await processMessage(PHONE, 'CANCEL');
      expect(reply).toContain('Welcome to mARI Platform by Pameltex Tech');
    });
  });

  // Web app link
  describe('Web app link (option 6)', () => {
    test('Option 6 returns web app URL', async () => {
      await processMessage(PHONE, 'hello');
      const reply = await processMessage(PHONE, '6');
      expect(reply).toContain('http');
      expect(reply).toContain('Open mARI Platform by Pameltex Tech');
    });
  });
});
