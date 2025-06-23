// lib/supabase.js - Supabase Client
import { createClient } from '@supabase/supabase-js';
import { config } from '../../public/config.js';
//const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
//const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseUrl = config.supabase.id;
const supabaseAnonKey = config.supabase.key;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
