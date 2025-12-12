const crypto = require('crypto-js');
const fs = require('fs');

// Function to encrypt a file using AES-256-GCM
function encryptFile(filePath) {
  // Read the file as buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Generate a random AES-256 key
  const key = crypto.lib.WordArray.random(256 / 8); // 256 bits

  // Convert key to base64 string
  const encryptionKey = key.toString(crypto.enc.Base64);

  // Generate a random IV (12 bytes for GCM)
  const iv = crypto.lib.WordArray.random(12);

  // Convert buffer to WordArray
  const wordArray = crypto.lib.WordArray.create(fileBuffer);

  // Encrypt the file data
  const encrypted = crypto.AES.encrypt(wordArray, key, {
    iv: iv,
    mode: crypto.mode.GCM,
    padding: crypto.pad.NoPadding, // GCM doesn't need padding
  });

  // Combine IV and encrypted data
  const combined = iv.concat(encrypted.ciphertext);

  // Return as hex string
  const encryptedData = combined.toString(crypto.enc.Hex);

  return {
    encryptedData: encryptedData,
    encryptionKey: encryptionKey,
  };
}

module.exports = { encryptFile };

// Function to decrypt encrypted data using AES-256-GCM
function decryptFile(encryptedDataHex, encryptionKey) {
  // Convert hex to WordArray
  const combined = crypto.enc.Hex.parse(encryptedDataHex);

  // Extract IV (first 12 bytes)
  const iv = crypto.lib.WordArray.create(combined.words.slice(0, 3), 12); // 12 bytes = 3 words (32-bit)

  // Extract encrypted data
  const encrypted = crypto.lib.WordArray.create(combined.words.slice(3), combined.sigBytes - 12);

  // Decode the base64 key
  const key = crypto.enc.Base64.parse(encryptionKey);

  // Decrypt the data
  const decrypted = crypto.AES.decrypt(
    { ciphertext: encrypted },
    key,
    {
      iv: iv,
      mode: crypto.mode.GCM,
      padding: crypto.pad.NoPadding,
    }
  );

  // Convert to buffer
  const decryptedBuffer = Buffer.from(decrypted.toString(crypto.enc.Hex), 'hex');

  return decryptedBuffer;
}

module.exports = { encryptFile, decryptFile };