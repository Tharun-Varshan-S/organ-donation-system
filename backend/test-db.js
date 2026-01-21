import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('--- DB Diagnostic ---');
console.log('CWD:', process.cwd());
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined (length: ' + process.env.MONGODB_URI.length + ')' : 'Undefined');

const connect = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI is not defined in .env');
            return;
        }
        console.log('Attempting to connect to:', uri.split('@')[1] || 'hidden');
        await mongoose.connect(uri);
        console.log('✅ Connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:');
        console.error(err);
        process.exit(1);
    }
};

connect();
