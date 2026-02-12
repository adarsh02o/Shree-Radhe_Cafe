// ============================================================
// Supabase Client Configuration
// ============================================================
// INSTRUCTIONS:
// 1. Go to https://supabase.com and create a new project
// 2. Go to Settings > API
// 3. Copy the "Project URL" and "anon public" key
// 4. Paste them below
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';          // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g., eyJhbGciOiJIUzI1NiIs...

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
