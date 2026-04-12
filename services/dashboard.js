/**
 * services/dashboard.js
 * Centralized dashboard data gathering to ensure parity between channels.
 */
import { VukaService } from './vuka.js';
import { PaymentService } from './payment.js';
import { getSupabaseClient } from '../src/lib/supabaseClient.js';

export const DashboardService = {
    /**
     * Get all dashboard data for a user
     * @param {string} msisdn Normalized phone number
     */
    getData: async (msisdn) => {
        const cleanMsisdn = msisdn.replace(/\+/g, '').trim();
        const supabase = getSupabaseClient();
        
        let profile = {
            name: 'Guest',
            role: 'Farmer',
            location: 'Unknown',
            linkedWhatsapp: null,
            bio: '',
            friendsCount: 0
        };

        try {
            // Fetch everything in parallel
            const [vukaData, subStatus, friends, scanResult] = await Promise.all([
                VukaService.getUser(cleanMsisdn),
                PaymentService.checkSubscription(cleanMsisdn),
                VukaService.getFriends(cleanMsisdn),
                supabase.from('resources').select('*', { count: 'exact', head: true }).eq('phone', cleanMsisdn).eq('type', 'Diagnosis')
            ]);

            if (vukaData) {
                if (vukaData.name) profile.name = vukaData.name;
                if (vukaData.role) profile.role = vukaData.role.charAt(0).toUpperCase() + vukaData.role.slice(1);
                if (vukaData.lat && vukaData.lng) profile.location = `${vukaData.lat.toFixed(2)}, ${vukaData.lng.toFixed(2)}`;
                if (vukaData.whatsapp_number) profile.linkedWhatsapp = vukaData.whatsapp_number;
                if (vukaData.bio) profile.bio = vukaData.bio;
            }

            // Fallback for name if still Guest
            if (profile.name === 'Guest') {
                const { data: waSession } = await supabase.from('whatsapp_sessions').select('email').eq('phone', cleanMsisdn).maybeSingle();
                if (waSession?.email) profile.name = waSession.email.split('@')[0];
            }

            profile.friendsCount = friends.length;

            return {
                profile,
                subscription: subStatus,
                stats: {
                    scans: scanResult.count || 0
                }
            };
        } catch (e) {
            console.warn('[DashboardService] Error fetching data:', e.message);
            return {
                profile,
                subscription: { active: false, planType: 'Error' },
                stats: { scans: 0 }
            };
        }
    }
};
