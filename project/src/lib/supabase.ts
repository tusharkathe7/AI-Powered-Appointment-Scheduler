import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
const supabaseUrl = 'https://example.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);