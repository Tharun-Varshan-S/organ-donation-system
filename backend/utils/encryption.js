import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
// Ensure ENCRYPTION_KEY is set in .env and is 32 bytes (64 hex characters)
// Fallback for dev ONLY if not set (DO NOT USE IN PRODUCTION)
const key = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto.randomBytes(32);

const ivLength = 16;

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text 
 * @returns {string} iv:encryptedText
 */
export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Fallback to plain text if encryption fails (safe fail? debatable but preserves data flow)
    }
};

/**
 * Decrypts text using AES-256-CBC
 * @param {string} text 
 * @returns {string} decrypted text
 */
export const decrypt = (text) => {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) return text; // Not encrypted or invalid format, return as is (backward compat)

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // If decryption fails, likely because it wasn't encrypted or key changed. Return original text.
        return text;
    }
};
