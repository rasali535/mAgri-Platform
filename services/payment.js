/**
 * services/payment.js
 * Implementation of Orange Money Web Payment API.
 */
import db from './database.js';
import axios from 'axios';

const ORANGE_MONEY_API = process.env.ORANGE_MONEY_API || 'https://api.orange.com/orange-money-webpay/dev/v1';

export const PaymentService = {
    /**
     * Initiate a payment to get a payToken
     * @param {string} msisdn User's phone number
     * @param {number} amount Amount to charge
     * @param {string} planType 'MONTHLY' or 'YEARLY'
     */
    initiatePayment: async (msisdn, amount, planType) => {
        try {
            // Mocking the Orange Money initiate call check
            if (!process.env.ORANGE_MERCHANT_KEY) {
                console.log(`[SIMULATED] Initiated Orange Money payment for ${msisdn}: ${amount} BWP`);
                const mockToken = 'mock_token_' + Date.now();
                return { success: true, payToken: mockToken };
            }

            // Real API integration would go here:
            // 1. Get OAuth Access Token
            // 2. POST /webpayment/v1/declaration to get payToken
            
            const response = await axios.post(`${ORANGE_MONEY_API}/webpayment/v1/declaration`, {
                merchant_key: process.env.ORANGE_MERCHANT_KEY,
                currency: 'BWP',
                order_id: `SUBS_${msisdn}_${Date.now()}`,
                amount: amount,
                return_url: 'https://mari.platform/success',
                cancel_url: 'https://mari.platform/cancel',
                notif_url: 'https://mari.platform/api/payment/callback',
                lang: 'en'
            }, {
                headers: { 'Authorization': `Bearer ${process.env.ORANGE_ACCESS_TOKEN}` }
            });

            return { success: true, payToken: response.data.pay_token };
        } catch (e) {
            console.error('Orange Money Initiation Error:', e.response?.data || e.message);
            return { success: false, error: 'Payment initiation failed.' };
        }
    },

    /**
     * Validate the 6-digit OTP provided by the user
     * @param {string} msisdn
     * @param {string} payToken
     * @param {string} otp 6-digit OTP from *145#
     */
    validateOTP: async (msisdn, payToken, otp, planType) => {
        try {
            // Mocking the OTP validation
            if (otp === '123456' || !process.env.ORANGE_MERCHANT_KEY) {
                console.log(`[SIMULATED] Orange Money OTP ${otp} validated for ${msisdn}`);
                
                // Update subscription in DB
                const expiryDate = new Date();
                if (planType === 'YEARLY') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                else expiryDate.setMonth(expiryDate.getMonth() + 1);

                db.prepare(`
                    INSERT OR REPLACE INTO subscriptions (userId, planType, status, expiryDate)
                    VALUES (?, ?, ?, ?)
                `).run(msisdn, planType, 'ACTIVE', expiryDate.toISOString());

                return { success: true, message: 'Subscription activated successfully!' };
            }

            // Real API integration would go here:
            // POST /webpayment/v1/transaction/${payToken}/validate
            const response = await axios.post(`${ORANGE_MONEY_API}/webpayment/v1/transaction/${payToken}/validate`, {
                otp: otp
            }, {
                headers: { 'Authorization': `Bearer ${process.env.ORANGE_ACCESS_TOKEN}` }
            });

            if (response.data.status === 'SUCCESS') {
                // Update DB...
                return { success: true };
            }

            return { success: false, error: 'Invalid OTP or Transaction failed.' };
        } catch (e) {
            console.error('Orange Money Validation Error:', e.response?.data || e.message);
            return { success: false, error: 'OTP validation failed.' };
        }
    },

    /**
     * Check if a user has an active subscription
     */
    checkSubscription: (msisdn) => {
        const sub = db.prepare('SELECT * FROM subscriptions WHERE userId = ?').get(msisdn);
        if (!sub) return { active: false };
        
        const isExpired = new Date(sub.expiryDate) < new Date();
        return {
            active: sub.status === 'ACTIVE' && !isExpired,
            planType: sub.planType,
            expiryDate: sub.expiryDate
        };
    }
};
