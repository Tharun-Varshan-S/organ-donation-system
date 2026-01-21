import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://tharunvarshans087_db_user:gbrBtOtzQJxjPEyg@cluster0.zifztjc.mongodb.net/healthcare_db?appName=Cluster0";

console.log('--- SRV URI Test ---');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

async function run() {
    try {
        console.log('Attempting to connect using SRV URI...');
        await client.connect();
        console.log('✅ Connected successfully with SRV URI!');
        process.exit(0);
    } catch (err) {
        console.error('❌ SRV connection failed:');
        console.error(err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
