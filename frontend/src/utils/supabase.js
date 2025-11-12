import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTM3MDYsImV4cCI6MjA3NzU4OTcwNn0.gKqyz4lOh6FHkc4tJ_5g4C-ZgeCzA0RwG3-HZ2m9aGA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    redirectTo: process.env.NODE_ENV === 'production'
      ? 'https://kazi-connect-seven.vercel.app/auth/callback'
      : 'http://localhost:3000/auth/callback'
  }
});
