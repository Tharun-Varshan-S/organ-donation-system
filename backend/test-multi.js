import { MongoClient } from 'mongodb';

const uri = "mongodb://tharunvarshans087_db_user:gbrBtOtzQJxjPEyg@ac-re4ovbt-shard-00-00.zifztjc.mongodb.net:27017,ac-re4ovbt-shard-00-01.zifztjc.mongodb.net:27017,ac-re4ovbt-shard-00-02.zifztjc.mongodb.net:27017/healthcare_db?ssl=true&authSource=admin";

console.log('--- Simplified Multi-Shard Test ---');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

async function run() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('✅ Connected successfully to multi-shard cluster!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Simplified multi-shard connection failed:');
        console.error(err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
