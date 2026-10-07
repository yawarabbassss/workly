import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getSecretKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'workly_default_super_secure_32char_key!';
  // Hash the secret to ensure it is exactly 32 bytes
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive string payload (API keys, auth tokens, passwords)
 */
export function encryptCredential(plainText: string): string {
  if (!plainText) return '';
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts encrypted credentials
 */
export function decryptCredential(cipherText: string): string {
  if (!cipherText || !cipherText.includes(':')) return '';
  try {
    const key = getSecretKey();
    const parts = cipherText.split(':');
    if (parts.length !== 3) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt credential:', err);
    return '';
  }
}

/**
 * Redacts secrets from data objects before recording them to public logs/executions
 */
export function redactSecrets(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    // Redact common bearer tokens, keys, and password patterns
    return data
      .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
      .replace(/(api_key|apiKey|password|secret|token)=["']?[^&"'\s]+["']?/gi, '$1=[REDACTED]');
  }
  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item));
  }
  if (typeof data === 'object') {
    const redacted: Record<string, any> = {};
    const sensitiveKeys = ['authorization', 'api_key', 'apikey', 'password', 'secret', 'token', 'x-api-key', 'credential', 'private_key'];
    
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSecrets(value);
      }
    }
    return redacted;
  }
  return data;
}

/**
 * Generates a cryptographically secure random token for Webhooks
 */
export function generateWebhookToken(): string {
  return `wh_${crypto.randomBytes(16).toString('hex')}`;
}
