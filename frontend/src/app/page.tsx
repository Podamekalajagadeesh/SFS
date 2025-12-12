'use client';

import { useState } from 'react';
import { encryptFile, decryptFile } from '@/utils/encryption';
import { storeKey, getKey, getAllKeys, deleteKey, exportKey } from '@/utils/keyManager';
import { uploadToNFTStorage, fetchFromIPFS } from '@/utils/nftStorage';
import { useWriteContract } from 'wagmi';
import contractData from '@/contract/SFS.json';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadKey, setDownloadKey] = useState('');
  const [encryptedData, setEncryptedData] = useState<ArrayBuffer | null>(null);
  const [keys, setKeys] = useState(getAllKeys());
  const [downloadFileId, setDownloadFileId] = useState('');
  const [downloadDecryptKey, setDownloadDecryptKey] = useState('');
  const [downloadCID, setDownloadCID] = useState('');

  const { writeContract } = useWriteContract();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile) return;
    try {
      const result = await encryptFile(selectedFile);
      setEncryptedData(result.encryptedData);
      // Store key locally (task 2)
      storeKey(selectedFile.name, result.encryptionKey, selectedFile.name);
      setKeys(getAllKeys()); // Refresh keys

      // Upload encrypted file to NFT.Storage
      const encryptedBlob = new Blob([result.encryptedData]);
      const cid = await uploadToNFTStorage(encryptedBlob as any); // NFT.Storage expects File, but Blob works
      console.log('File uploaded to IPFS with CID:', cid);

      // Call smart contract to store CID
      writeContract({
        address: contractData.address as `0x${string}`,
        abi: contractData.abi,
        functionName: 'uploadFile',
        args: [selectedFile.name, cid, BigInt(result.encryptedData.byteLength)],
      });

      alert(`File encrypted, key stored locally, uploaded to IPFS with CID: ${cid}, and metadata stored on blockchain!`);
    } catch (error) {
      console.error('Encryption or upload failed:', error);
      alert('Failed to encrypt or upload file');
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData || !downloadKey) return;
    try {
      const decrypted = await decryptFile(encryptedData, downloadKey);
      // Create download link for decrypted file
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile?.name || 'decrypted_file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('File decrypted and downloaded!');
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Check the key.');
    }
  };

  const handleDownloadFromIPFS = async () => {
    if (!downloadCID || !downloadDecryptKey) return;
    try {
      // Fetch encrypted content from IPFS
      const encryptedContent = await fetchFromIPFS(downloadCID);

      // Decrypt file
      const decrypted = await decryptFile(encryptedContent, downloadDecryptKey);

      // Create download link
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'downloaded_file'; // Could be improved
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log FileDownloaded event if fileId provided
      if (downloadFileId) {
        writeContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: 'downloadFile',
          args: [BigInt(downloadFileId)],
        });
      }

      alert('File downloaded and decrypted successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Check CID and key.');
    }
  };

  const handleExportKey = (fileId: string) => {
    const key = getKey(fileId);
    if (key) {
      exportKey(key, `${fileId}_key.txt`);
    }
  };

  const handleDeleteKey = (fileId: string) => {
    deleteKey(fileId);
    setKeys(getAllKeys());
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">SFS - Secure File Sharing</h1>
        <p className="text-xl text-gray-600">Encrypt and decrypt files securely</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Upload & Encrypt</h2>
        <input
          type="file"
          onChange={handleFileSelect}
          className="mb-4 w-full"
        />
        <button
          onClick={handleEncrypt}
          disabled={!selectedFile}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 w-full"
        >
          Encrypt File
        </button>
      </div>

      {/* Download Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Download & Decrypt</h2>
        <input
          type="text"
          placeholder="Enter encryption key"
          value={downloadKey}
          onChange={(e) => setDownloadKey(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <button
          onClick={handleDecrypt}
          disabled={!encryptedData || !downloadKey}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300 w-full"
        >
          Decrypt & Download
        </button>
      </div>

      {/* Key Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Stored Keys</h2>
        {keys.length === 0 ? (
          <p className="text-gray-500">No keys stored</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((keyEntry) => (
              <li key={keyEntry.fileId} className="flex justify-between items-center p-2 border rounded">
                <span>{keyEntry.fileName || keyEntry.fileId}</span>
                <div>
                  <button
                    onClick={() => handleExportKey(keyEntry.fileId)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 text-sm"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteKey(keyEntry.fileId)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Download from IPFS Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Download from IPFS</h2>
        <input
          type="text"
          placeholder="Enter CID"
          value={downloadCID}
          onChange={(e) => setDownloadCID(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Enter encryption key"
          value={downloadDecryptKey}
          onChange={(e) => setDownloadDecryptKey(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="File ID (optional for logging)"
          value={downloadFileId}
          onChange={(e) => setDownloadFileId(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <button
          onClick={handleDownloadFromIPFS}
          disabled={!downloadCID || !downloadDecryptKey}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 w-full"
        >
          Download & Decrypt
        </button>
      </div>
    </main>
  );
}
