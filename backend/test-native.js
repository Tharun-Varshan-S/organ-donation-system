import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

console.log('--- Native Driver Test ---');
console.log('Using URI:', uri.split('@')[1] || 'hidden');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

async function run() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('✅ Connected successfully with native driver!');

        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));

        process.exit(0);
    } catch (err) {
        console.error('❌ Native connection failed:');
        console.error(err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
