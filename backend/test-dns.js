import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);

async function checkDns() {
    console.log('--- DNS Diagnostic ---');
    try {
        console.log('Checking default DNS...');
        const addresses = await resolveSrv('_mongodb._tcp.cluster0.zifztjc.mongodb.net');
        console.log('Default DNS result:', addresses);
    } catch (err) {
        console.error('Default DNS failed:', err.message);

        console.log('Switching to Google DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8']);
        try {
            const addresses = await resolveSrv('_mongodb._tcp.cluster0.zifztjc.mongodb.net');
            console.log('Google DNS result:', addresses);
        } catch (err2) {
            console.error('Google DNS also failed:', err2.message);
        }
    }
}

checkDns();
