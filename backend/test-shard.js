import { MongoClient } from 'mongodb';

const uri = "mongodb://tharunvarshans087_db_user:gbrBtOtzQJxjPEyg@ac-re4ovbt-shard-00-00.zifztjc.mongodb.net:27017/healthcare_db?ssl=true&authSource=admin";

console.log('--- Single Shard Test ---');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

async function run() {
    try {
        console.log('Attempting to connect to Shard 0...');
        await client.connect();
        console.log('✅ Connected successfully to Shard 0!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Single shard connection failed:');
        console.error(err);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
