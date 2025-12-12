// Web Crypto API for AES-256-GCM encryption

export async function encryptFile(file: File): Promise<{ encryptedData: ArrayBuffer; encryptionKey: string }> {
  // Generate a random AES-256-GCM key
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt']
  );

  // Export the key as a base64 string
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const encryptionKey = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  // Read the file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

  // Encrypt the file data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileBuffer
  );

  // Prepend IV to encrypted data for decryption
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return {
    encryptedData: combined.buffer,
    encryptionKey,
  };
}

export async function decryptFile(encryptedData: ArrayBuffer, encryptionKey: string): Promise<ArrayBuffer> {
  // Decode the base64 key
  const keyData = Uint8Array.from(atob(encryptionKey), c => c.charCodeAt(0));

  // Import the key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['decrypt']
  );

  // Extract IV from the beginning of encryptedData
  const iv = new Uint8Array(encryptedData.slice(0, 12));
  const encrypted = encryptedData.slice(12);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encrypted
  );

  return decryptedData;
}