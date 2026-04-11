/**
 * services/cron.js
 * Daily background tasks for mARI Platform.
 */
import cron from 'node-cron';
import db from './database.js';
import { sendSMS, sendWhatsApp } from '../whatsapp/africa.js';
import { DateTime } from 'luxon';

export const initCron = () => {
    // Run daily at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running daily subscription check...');

        try {
            // Find subscriptions expiring in 3 days
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            const dateStr = threeDaysFromNow.toISOString().split('T')[0];

            const expiringSoon = db.prepare(`
                SELECT * FROM subscriptions 
                WHERE status = 'ACTIVE' 
                AND expiryDate LIKE ?
            `).all(dateStr + '%');

            for (const sub of expiringSoon) {
                const message = `🌱 mAgri Alert: Your ${sub.planType} subscription is expiring in 3 days. Dial *145# to generate a payment OTP and keep your access!`;

                console.log(`[Cron] Notifying ${sub.userId} of expiry...`);

                // Send SMS
                await sendSMS(sub.userId, message);

                // Try WhatsApp if they are on it
                try {
                    await sendWhatsApp(sub.userId, message);
                } catch (waErr) {
                    // Ignore WA errors if not registered
                }
            }
        } catch (e) {
            console.error('[Cron Error]', e);
        }
    });

    console.log('[Cron] Initialized.');
};
