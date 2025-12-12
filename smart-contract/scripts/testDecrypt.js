const { encryptFile, decryptFile } = require('./encryptFile');
const fs = require('fs');
const path = require('path');

// Test decryption for different file types
function testDecryption() {
  const testDir = path.join(__dirname, '..', 'test-files');

  // Test with text file
  const textFile = path.join(testDir, 'test.txt');
  console.log('Testing text file...');
  const { encryptedData, encryptionKey } = encryptFile(textFile);
  const decryptedBuffer = decryptFile(encryptedData, encryptionKey);
  const originalBuffer = fs.readFileSync(textFile);
  if (Buffer.compare(decryptedBuffer, originalBuffer) === 0) {
    console.log('Text file decryption: PASSED');
  } else {
    console.log('Text file decryption: FAILED');
  }

  // For image, pdf, mp4, create dummy buffers and test
  const types = ['image', 'pdf', 'mp4'];
  types.forEach(type => {
    console.log(`Testing ${type}...`);
    // Create a dummy buffer (e.g., 100 bytes of random data)
    const dummyBuffer = Buffer.alloc(100, Math.random() * 256);
    // Since encryptFile takes filePath, create a temp file
    const tempFile = path.join(testDir, `test.${type}`);
    fs.writeFileSync(tempFile, dummyBuffer);
    const { encryptedData: enc, encryptionKey: key } = encryptFile(tempFile);
    const decrypted = decryptFile(enc, key);
    if (Buffer.compare(decrypted, dummyBuffer) === 0) {
      console.log(`${type} decryption: PASSED`);
    } else {
      console.log(`${type} decryption: FAILED`);
    }
    // Clean up
    fs.unlinkSync(tempFile);
  });
}

testDecryption();