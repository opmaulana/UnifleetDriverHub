/**
 * ASAS Mobility Platform - Authentication Service
 * 
 * This service handles all authentication logic for the fleet operations platform.
 * Currently using mock implementations for the UI phase.
 * 
 * Future Integration:
 * Replace mock implementations with direct Supabase Auth calls:
 * `supabase.auth.signInWithOtp()`
 * `supabase.auth.verifyOtp()`
 */

import { supabase } from '../../lib/supabase';

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  isFirstTime?: boolean;
}

export const AuthService = {
  /**
   * Request an OTP to be sent to the driver's phone
   */
  sendOTP: async (phone: string): Promise<AuthResponse> => {
    try {
      // Ensure phone starts with '+'
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Verify the 6-digit OTP code
   */
  verifyOTP: async (phone: string, token: string): Promise<AuthResponse> => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const { data: { user, session }, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms'
      });

      if (error) throw error;

      // Check if driver profile exists in our 'drivers' table
      const { data: driverData } = await supabase
        .from('drivers')
        .select('onboarding_completed')
        .eq('id', user?.id)
        .single();

      // If driver doesn't exist or hasn't finished onboarding, route them there
      const isFirstTimeDriver = !driverData?.onboarding_completed;

      return { 
        success: true,
        user,
        isFirstTime: isFirstTimeDriver
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Complete driver onboarding
   */
  completeOnboarding: async (phone: string, data: { name: string, vehicle: string }): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // MOCK: Save profile to Supabase `drivers` table
        resolve({ success: true });
      }, 1000);
    });
  },

  /**
   * Complete permission granting
   */
  completePermissions: async (phone: string): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // MOCK: Update Supabase `drivers` table with permissions_granted = true
        resolve({ success: true });
      }, 500);
    });
  }
};
