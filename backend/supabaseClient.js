/**
 * Supabase client configuration for Kazilink backend
 * Used for real-time features, email verification, and database operations
 * Environment variables ensure secure credential management
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
// Falls back to empty strings if not configured (disables realtime features)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Warn if Supabase is not configured - realtime publishing will be disabled
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase URL or Service Role key not set. Realtime publishing will be disabled.');
}

// Create and export Supabase client instance
const supabase = createClient(supabaseUrl || '', supabaseServiceRoleKey || '');

module.exports = supabase;
