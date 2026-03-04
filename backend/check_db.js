const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/Acer/Kazi_Connect/backend/.env' });

const UserSchema = new mongoose.Schema({ email: String }, { strict: false });
const PendingUserSchema = new mongoose.Schema({ email: String }, { strict: false });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI.split('@')[1]); // Log host only for safety
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        const User = mongoose.model('UserCheck', UserSchema, 'users');
        const PendingUser = mongoose.model('PendingUserCheck', PendingUserSchema, 'pendingusers');

        const pending = await PendingUser.find({}).lean();
        console.log('PendingUsers Count:', pending.length);
        if (pending.length > 0) {
            console.log('Sample PendingUser Email:', pending[0].email);
        }

        const users = await User.find({}).lean();
        console.log('Users Count:', users.length);
        if (users.length > 0) {
            console.log('Sample User Email:', users[0].email);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
