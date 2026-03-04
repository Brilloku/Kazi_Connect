const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vblmjxagxeangahqjspv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibG1qeGFneGVhbmdhaHFqc3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTM3MDYsImV4cCI6MjA3NzU4OTcwNn0.gKqyz4lOh6FHkc4tJ_5g4C-ZgeCzA0RwG3-HZ2m9aGA';

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
