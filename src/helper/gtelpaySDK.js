import { importKey, base64ToArrayBuffer, arrayBufferToBase64, getAlgorithmForUsage } from './gtelpayHelpers';

const GTELPAY_CONFIG = {
  agentGateway: process.env.REACT_APP_GTELPAY_AGENT_GATEWAY,
  apiKey: process.env.REACT_APP_GTELPAY_API_KEY,
  partnerCode: process.env.REACT_APP_GTELPAY_PARTNER_CODE,
  partnerAppId: process.env.REACT_APP_GTELPAY_PARTNER_APP_ID,
  isEnabled: () => {
    const required = [
      'REACT_APP_GTELPAY_AGENT_GATEWAY',
      'REACT_APP_GTELPAY_API_KEY',
      'REACT_APP_GTELPAY_PARTNER_CODE',
      'REACT_APP_GTELPAY_PARTNER_APP_ID',
      'REACT_APP_GTELPAY_PRIVATE_KEY'
    ];
    return required.every(key => process.env[key]) && process.env.REACT_APP_MINIAPP_GTELPAY === '1';
  }
};

// Init SDK: store private key to localStorage
export const initGtelpaySDK = () => {
  if (!GTELPAY_CONFIG.isEnabled() || localStorage.getItem('gtelpay_private_key')) {
    return;
  }

  try {
    const privateKeyPEM = process.env.REACT_APP_GTELPAY_PRIVATE_KEY
      ?.trim()
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n');
    
    if (privateKeyPEM) {
      localStorage.setItem('gtelpay_private_key', privateKeyPEM);
    }
  } catch (err) {
    console.error('Failed to initialize Gtelpay SDK:', err);
  }
};

export const getGtelpayConfig = () => ({
  ...GTELPAY_CONFIG,
  isEnabled: GTELPAY_CONFIG.isEnabled()
});

// RSA+AES decrypt: key first, then data
export const decryptAccessCode = async (encryptedKey, encryptedData) => {
  try {
    const CryptoJS = require('crypto-js');
    const crypto = window.crypto.subtle;
    const privateKeyPEM = localStorage.getItem('gtelpay_private_key');
    
    if (!privateKeyPEM) {
      throw new Error('Private key not found');
    }

    const privateKey = await importKey(privateKeyPEM, 'pkcs8', 'decrypt');

    const secretKeyBuffer = await crypto.decrypt(
      getAlgorithmForUsage('decrypt'),
      privateKey,
      base64ToArrayBuffer(encryptedKey)
    );

    const secretKeyBase64 = arrayBufferToBase64(secretKeyBuffer);

    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Base64.parse(secretKeyBase64),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    return decryptedText;
  } catch (error) {
    throw error;
  }
};

// Decrypt consent_data (format: encrypted_data.encrypted_key)
export const decryptConsentData = async (consentData) => {
  try {
    if (!consentData?.includes('.')) {
      throw new Error('Invalid consent_data format');
    }

    const [encryptedData, encryptedKey] = consentData.split('.');
    const decrypted = await decryptAccessCode(encryptedKey, encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    throw error;
  }
};

// Sign request body with SHA256withRSA
export const createSignature = async (jsonData) => {
  try {
    const crypto = window.crypto.subtle;
    const privateKeyPEM = localStorage.getItem('gtelpay_private_key');
    
    if (!privateKeyPEM) throw new Error('Private key not found');

    const privateKey = await importKey(privateKeyPEM, 'pkcs8', 'sign');
    const signatureBuffer = await crypto.sign(
      getAlgorithmForUsage('sign'),
      privateKey,
      new TextEncoder().encode(jsonData)
    );

    return arrayBufferToBase64(signatureBuffer);
  } catch (error) {
    throw error;
  }
};

// Verify response signature from Gtelpay
export const verifyResponseSignature = async (responseBody, signatureHeader) => {
  try {
    const publicKeyPEM = process.env.REACT_APP_GTELPAY_PUBLIC_KEY;
    
    if (!publicKeyPEM) return true; // Skip if no public key

    const crypto = window.crypto.subtle;
    const publicKey = await importKey(publicKeyPEM, 'spki', 'verify');

    const signatureBytes = new Uint8Array(
      atob(signatureHeader)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.verify(
      getAlgorithmForUsage('verify'),
      publicKey,
      signatureBytes,
      new TextEncoder().encode(responseBody)
    );

    if (!isValid) throw new Error('Invalid response signature');

    return true;
  } catch (error) {
    throw error;
  }
};

// Parse URL params from Universal Link
export const parseUniversalLinkParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {
    encryptedAccessCode: params.get('access_code'),
    encryptedKey: params.get('key'),
    transactionId: params.get('transaction_id')
  };
  
  if (!result.encryptedAccessCode || !result.encryptedKey || !result.transactionId) {
    throw new Error('[Gtelpay] Missing URL parameters');
  }
  
  return result;
};

// Check if from Gtelpay Universal Link
export const isFromGtelpayUniversalLink = () => {
  if (!GTELPAY_CONFIG.isEnabled()) return false;
  const params = new URLSearchParams(window.location.search);
  return !!(params.get('access_code') && params.get('key') && params.get('transaction_id'));
};

// Clean up URL params for security
export const cleanupUrlParams = () => {
  if (window.history?.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};
