// Parse PEM key: remove headers/footers
export const parsePEMKey = (pemKey) => {
  return pemKey
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .trim();
};

// URL-safe base64 to ArrayBuffer
export const base64ToArrayBuffer = (base64String) => {
  const cleanBase64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// ArrayBuffer to base64
export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Crypto algorithms for sign/verify/decrypt
const ALGORITHMS = {
  sign: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  verify: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  decrypt: { name: 'RSA-OAEP', hash: 'SHA-256' }
};

export const getAlgorithmForUsage = (usage) => {
  if (!ALGORITHMS[usage]) throw new Error(`Invalid usage: ${usage}`);
  return ALGORITHMS[usage];
};

// Import PEM key to Web Crypto
export const importKey = async (pemKey, keyType, usage) => {
  const crypto = window.crypto.subtle;
  const cleanKeyData = parsePEMKey(pemKey);
  const keyBuffer = base64ToArrayBuffer(cleanKeyData);
  const algorithm = getAlgorithmForUsage(usage);
  return crypto.importKey(keyType, keyBuffer, algorithm, false, [usage]);
};
