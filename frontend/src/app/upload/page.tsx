'use client';

import { useState } from 'react';
import { encryptFile } from '@/utils/encryption';
import { storeKey } from '@/utils/keyManager';
import { uploadToNFTStorage } from '@/utils/nftStorage';
import { useWriteContract, useReadContract } from 'wagmi';
import contractData from '@/contract/SFS.json';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const [uploadedCID, setUploadedCID] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { writeContract } = useWriteContract();

  const { data: nextFileId } = useReadContract({
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'nextFileId',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      // Encrypt file
      const result = await encryptFile(selectedFile);

      // Store key locally
      storeKey(selectedFile.name, result.encryptionKey, selectedFile.name);

      // Upload to NFT.Storage
      const encryptedBlob = new Blob([result.encryptedData]);
      const cid = await uploadToNFTStorage(encryptedBlob as any);

      // Store on blockchain
      writeContract({
        address: contractData.address as `0x${string}`,
        abi: contractData.abi,
        functionName: 'uploadFile',
        args: [selectedFile.name, cid, BigInt(result.encryptedData.byteLength)],
      });

      // Set success states
      setUploadedCID(cid);
      setUploadedFileId(nextFileId ? Number(nextFileId) : null); // This will be the ID after upload
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Upload File</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-lg mb-2">
              {selectedFile ? selectedFile.name : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">Files are encrypted before upload</p>
          </label>
        </div>
        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>File:</strong> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload & Encrypt'}
        </button>
        {uploadedCID && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Upload Successful!</h3>
            <p className="text-sm text-green-700">
              <strong>File ID:</strong> {uploadedFileId}
            </p>
            <p className="text-sm text-green-700">
              <strong>CID:</strong> {uploadedCID}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}