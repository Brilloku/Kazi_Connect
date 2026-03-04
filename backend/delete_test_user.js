require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteUser() {
    const email = 'kayoma7757@nctime.com';
    console.log(`Attempting to delete user: ${email}`);

    // List users to find the ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found, nothing to delete.');
        return;
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError);
    } else {
        console.log('User deleted successfully.');
    }
}

deleteUser();
