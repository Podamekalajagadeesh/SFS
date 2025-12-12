'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import contractData from '@/contract/SFS.json';
import Link from 'next/link';
import { fetchFromIPFS } from '@/utils/nftStorage';
import { decryptFile } from '@/utils/encryption';
import { getKey } from '@/utils/keyManager';

interface FileData {
  id: number;
  name: string;
  cid: string;
  size: bigint;
  owner: string;
  downloadCount: bigint;
}

export default function MyFilesPage() {
  const { address } = useAccount();
  const [files, setFiles] = useState<FileData[]>([]);
  const { writeContract } = useWriteContract();

  // Read ownerFiles
  const { data: fileIds } = useReadContract({
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'ownerFiles',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (fileIds && address) {
      const loadFiles = async () => {
        const filePromises = (fileIds as bigint[]).map(async (id) => {
          const fileData = await readContract({
            address: contractData.address as `0x${string}`,
            abi: contractData.abi,
            functionName: 'files',
            args: [id],
          }) as [string, string, bigint, `0x${string}`, bigint];
          return {
            id: Number(id),
            name: fileData[0],
            cid: fileData[1],
            size: fileData[2],
            owner: fileData[3],
            downloadCount: fileData[4],
          };
        });
        const loadedFiles = await Promise.all(filePromises);
        setFiles(loadedFiles);
      };
      loadFiles();
    }
  }, [fileIds, address]);

  const handleDownload = async (file: FileData) => {
    const key = getKey(file.name);
    if (!key) {
      alert('Encryption key not found locally');
      return;
    }
    try {
      const encryptedContent = await fetchFromIPFS(file.cid);
      const decrypted = await decryptFile(encryptedContent, key);
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Update download count
      writeContract({
        address: contractData.address as `0x${string}`,
        abi: contractData.abi,
        functionName: 'downloadFile',
        args: [BigInt(file.id)],
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Files</h1>
      {files.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">
            No files uploaded yet.
          </p>
          <Link
            href="/upload"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Upload New File
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{file.name}</h3>
                  <p className="text-sm text-gray-600">CID: {file.cid}</p>
                  <p className="text-sm text-gray-600">Size: {Number(file.size)} bytes</p>
                  <p className="text-sm text-gray-600">File ID: {file.id}</p>
                  <p className="text-sm text-gray-600">Downloads: {Number(file.downloadCount)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  >
                    Download
                  </button>
                  <Link
                    href={`/share/${file.id}`}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  >
                    Share Access
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}