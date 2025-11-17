/**
 * Supabase client configuration for Kazilink frontend
 * Initializes Supabase client with environment variables
 * Used for authentication, real-time features, and database operations
 */

import { createClient } from '@supabase/supabase-js';

// Supabase project configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create and export Supabase client instance
// This client is used for:
// - User authentication (sign up, sign in, sign out)
// - Real-time subscriptions for notifications
// - Chat functionality
// - File storage (if implemented)
export const supabase = createClient(supabaseUrl, supabaseKey);
