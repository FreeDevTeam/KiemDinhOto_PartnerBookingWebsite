import CryptoJS from 'crypto-js';
import moment from 'moment';

// 1. Generate the date in hexadecimal format YYYYMMDD
function getDateAsHex() {
  const date = moment().format('YYYYMMDD');
  return CryptoJS.enc.Utf8.parse(date).toString(CryptoJS.enc.Hex);
}

// 2. Generate the Secret Key based on ENCRYPT_SECRET_KEY
function generateSecretKey() {
  const dateHex = getDateAsHex();
  const secretKeyPrefix = process.env.REACT_APP_ENCRYPT_SECRET_KEY || 'ENCRYPT_SECRET_KEY';
  const secretKey = secretKeyPrefix + dateHex;

  // AES-256 requires a 32-byte key; truncate or pad if needed
  return CryptoJS.enc.Utf8.parse(secretKey).toString(CryptoJS.enc.Hex).slice(0, 64);
}

// 3. Encrypt function using AES-256-CBC
function encryptAes256CBC(text) {
  const key = CryptoJS.enc.Hex.parse(generateSecretKey()); // Use hex format
  const iv = CryptoJS.lib.WordArray.random(16); // Generate 16-byte IV

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    idEn: iv.toString(CryptoJS.enc.Hex), // IV as a hex string
    dataEn: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
  };
}

// 4. Decrypt function using AES-256-CBC
function decryptAes256CBC(encryptedData) {
  const key = CryptoJS.enc.Hex.parse(generateSecretKey()); // Use hex format
  const iv = CryptoJS.enc.Hex.parse(encryptedData.idEn); // Parse hex IV

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Hex.parse(encryptedData.dataEn) },
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
    let result = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  return result
}

export { encryptAes256CBC, decryptAes256CBC };