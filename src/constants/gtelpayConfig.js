// Helper: Parse and clean PEM key
const parsePrivateKey = (privateKeyPEM) => {
  return privateKeyPEM
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .trim();
};

// Helper: Convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64String) => {
  const binaryString = atob(base64String.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Helper: Convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper: Import private key with specified usage
const importPrivateKeyWithUsage = async (privateKeyPEM, usage) => {
  const crypto = window.crypto.subtle;
  const keyData = parsePrivateKey(privateKeyPEM);
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const algorithm = usage === 'sign' 
    ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
    : { name: 'RSA-OAEP', hash: 'SHA-256' };

  return crypto.importKey(
    'pkcs8',
    bytes.buffer,
    algorithm,
    false,
    [usage]
  );
};

// Giải mã access_code bằng RSA + AES-ECB
export const decryptAccessCode = async (encryptedKey, encryptedData) => {
  try {
    const CryptoJS = require('crypto-js');
    const crypto = window.crypto.subtle;
    const privateKeyPEM = localStorage.getItem('gtelpay_private_key');
    
    if (!privateKeyPEM) {
      throw new Error('Private key không tồn tại. Vui lòng cấu hình.');
    }

    // RSA: Giải mã secret_key
    const privateKey = await importPrivateKeyWithUsage(privateKeyPEM, 'decrypt');
    const secretKeyBuffer = await crypto.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      base64ToArrayBuffer(encryptedKey)
    );

    // AES-ECB: Giải mã data bằng crypto-js
    const secretKeyBase64 = arrayBufferToBase64(secretKeyBuffer);
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Base64.parse(secretKeyBase64),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('[Gtelpay] Decrypt error:', error.message);
    throw error;
  }
};

// Giải mã consent_data (format: <encrypted_data>.<encrypted_key>)
export const decryptConsentData = async (consentData) => {
  try {
    const [encryptedData, encryptedKey] = consentData.split('.');
    const decrypted = await decryptAccessCode(encryptedKey, encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('[Gtelpay] Consent decrypt error:', error.message);
    throw error;
  }
};

// Xác minh signature từ response Gtelpay
export const verifyResponseSignature = async (responseBody, signatureHeader) => {
  try {
    const CryptoJS = require('crypto-js');
    
    // Public key của Gtelpay (thường được cung cấp hoặc lấy từ config)
    const publicKeyPEM = process.env.REACT_APP_GTELPAY_PUBLIC_KEY;
    
    //Public key không tồn tại, bỏ qua xác minh signature
    if (!publicKeyPEM) {
      return true;
    }

    const crypto = window.crypto.subtle;
    
    // Parse public key
    const publicKeyStr = publicKeyPEM
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\n/g, '')
      .replace(/\r/g, '');

    const binaryString = atob(publicKeyStr);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const publicKey = await crypto.importKey(
      'spki',
      bytes.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      atob(signatureHeader)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.verify(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      publicKey,
      signatureBytes,
      new TextEncoder().encode(responseBody)
    );

    if (!isValid) {
      throw new Error('Invalid response signature from Gtelpay');
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Tạo signature cho requests (SHA256withRSA)
export const createSignature = async (jsonData) => {
  try {
    const crypto = window.crypto.subtle;
    const privateKeyPEM = localStorage.getItem('gtelpay_private_key');
    
    if (!privateKeyPEM) {
      throw new Error('Private key không tồn tại');
    }

    const privateKey = await importPrivateKeyWithUsage(privateKeyPEM, 'sign');
    const signatureBuffer = await crypto.sign(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      privateKey,
      new TextEncoder().encode(jsonData)
    );

    return arrayBufferToBase64(signatureBuffer);
  } catch (error) {
    console.error('[Gtelpay] Signature error:', error.message);
    throw error;
  }
};

const validateConfig = () => {
  const required = [
    'REACT_APP_GTELPAY_AGENT_GATEWAY',
    'REACT_APP_GTELPAY_API_KEY',
    'REACT_APP_GTELPAY_PARTNER_CODE',
    'REACT_APP_GTELPAY_PARTNER_APP_ID',
    'REACT_APP_GTELPAY_PRIVATE_KEY'
  ];

  return required.every(key => process.env[key]) && process.env.REACT_APP_MINIAPP_GTELPAY === '1';
};

export const initGtelpayConfig = () => {
  if (!GTELPAY_CONFIG.isEnabled || localStorage.getItem('gtelpay_private_key')) {
    return;
  }

  try {
    const privateKeyPEM = process.env.REACT_APP_GTELPAY_PRIVATE_KEY
      .trim()
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n');
    
    if (privateKeyPEM) {
      localStorage.setItem('gtelpay_private_key', privateKeyPEM);
    }
  } catch (err) {
    console.error('[Gtelpay] Init error:', err.message);
  }
};

export const GTELPAY_CONFIG = {
  agentGateway: process.env.REACT_APP_GTELPAY_AGENT_GATEWAY,
  apiKey: process.env.REACT_APP_GTELPAY_API_KEY,
  partnerCode: process.env.REACT_APP_GTELPAY_PARTNER_CODE,
  partnerAppId: process.env.REACT_APP_GTELPAY_PARTNER_APP_ID,
  isEnabled: validateConfig()
};
