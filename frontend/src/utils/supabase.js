/**
 * Supabase client configuration for Kazilink frontend
 * Initializes Supabase client with environment variables
 * Used for authentication, real-time features, and database operations
 */

import { createClient } from '@supabase/supabase-js';

// Supabase project configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vblmjxagxeangahqjspv.REACT_APP_SUPABASE.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTM3MDYsImV4cCI6MjA3NzU4OTcwNn0.gKqyz4lOh6FHkc4tJ_5g4C-ZgeCzA0RwG3-HZ2m9aGA';

// Create and export Supabase client instance
// This client is used for:
// - User authentication (sign up, sign in, sign out)
// - Real-time subscriptions for notifications
// - Chat functionality
// - File storage (if implemented)
export const supabase = createClient(supabaseUrl, supabaseKey);
