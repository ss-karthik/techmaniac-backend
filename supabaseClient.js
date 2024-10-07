import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://swjudopsftggwxxeqzri.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)