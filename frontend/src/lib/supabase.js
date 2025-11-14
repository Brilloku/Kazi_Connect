import { supabase as existing } from '../utils/supabase';

// Re-export the existing supabase client for convenience
export const supabase = existing;
export default supabase;
