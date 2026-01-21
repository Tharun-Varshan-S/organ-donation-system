import tls from 'tls';

const host = 'ac-re4ovbt-shard-00-00.zifztjc.mongodb.net';
const port = 27017;

console.log(`Connecting to ${host}:${port} with TLS...`);

const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
    console.log('✅ TLS handshake SUCCESSFUL!');
    console.log('Authorized:', socket.authorized);
    console.log('Error:', socket.authorizationError);
    socket.destroy();
});

socket.setTimeout(5000);

socket.on('timeout', () => {
    console.log('❌ TLS connection TIMED OUT');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`❌ TLS connection FAILED: ${err.message}`);
});
