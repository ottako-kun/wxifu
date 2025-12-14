
import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const SUPABASE_URL = 'https://jjzdzzejtxkbhygfaeqv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3ck9WMf7c1WyTiiUjTMnHg_8G-oQwpw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
