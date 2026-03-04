const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = 'kayoma7757@nctime.com';
    const password = 'Password123!';
    const metadata = {
        name: 'Test User',
        role: 'youth',
        location: 'Nairobi',
        skills: ['Testing', 'Answering'],
        phone: '0712345678',
        password: password // Mimicking the frontend behavior
    };

    console.log('Attempting signup with:', email);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
            emailRedirectTo: 'http://localhost:3000/verify-email'
        }
    });

    if (error) {
        console.error('Signup Error:', error);
    } else {
        console.log('Signup Success:', data);
    }
}

testSignup();
