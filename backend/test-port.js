import net from 'net';

const host = 'ac-re4ovbt-shard-00-00.zifztjc.mongodb.net';
const port = 27017;

console.log(`Connecting to ${host}:${port}...`);

const socket = new net.Socket();

socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('✅ Port 27017 is OPEN!');
    socket.destroy();
});

socket.on('timeout', () => {
    console.log('❌ Connection TIMED OUT');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`❌ Connection FAILED: ${err.message}`);
});

socket.connect(port, host);
