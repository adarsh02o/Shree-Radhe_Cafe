import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// Get them from: Supabase Dashboard > Settings > API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // Create a mock/noop supabase client for demo mode
    console.warn(
        '⚠️ Supabase not configured. Running in DEMO mode.\n' +
        'To connect to Supabase, create a .env file in the frontend/ directory:\n' +
        'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
        'VITE_SUPABASE_ANON_KEY=your-anon-key'
    );

    // Minimal mock that won't crash the app
    const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
    const mockQuery = () => ({
        select: () => mockQuery(),
        insert: () => mockQuery(),
        update: () => mockQuery(),
        delete: () => mockQuery(),
        eq: () => mockQuery(),
        in: () => mockQuery(),
        order: () => mockQuery(),
        single: () => Promise.resolve(mockResponse),
        then: (resolve) => resolve(mockResponse),
    });

    supabase = {
        from: () => mockQuery(),
        auth: {
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            signOut: () => Promise.resolve(),
            getSession: () => Promise.resolve({ data: { session: null } }),
        },
        channel: () => ({
            on: function () { return this; },
            subscribe: function () { return this; },
        }),
        removeChannel: () => { },
    };
}

export { supabase };
