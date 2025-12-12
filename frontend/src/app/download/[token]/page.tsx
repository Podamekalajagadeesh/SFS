'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWriteContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import contractData from '@/contract/SFS.json';
import { fetchFromIPFS } from '@/utils/nftStorage';
import { decryptFile } from '@/utils/encryption';

export default function DownloadTokenPage() {
  const params = useParams();
  const token = params.token as string;
  const { writeContract } = useWriteContract();

  useEffect(() => {
    const download = async () => {
      try {
        // Check if token is valid
        const fileId = await readContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: 'tokenToFile',
          args: [`0x${token}` as `0x${string}`],
        }) as bigint;
        if (!fileId) {
          alert('Invalid token');
          return;
        }
        // Get file data
        const fileData = await readContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: 'getFile',
          args: [fileId],
        }) as [string, string, bigint, `0x${string}`, bigint];
        const cid = fileData[1];
        const name = fileData[0];
        // Download with token
        writeContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: 'downloadWithToken',
          args: [`0x${token}` as `0x${string}`],
        });
        // Fetch and decrypt - but need key? For token, perhaps the key is not needed, or assume public.
        // But since encrypted, perhaps token downloads are for public files, but in this system, all are encrypted.
        // Perhaps for token, the key is not used, or prompt.
        // To make it work, perhaps prompt for key.
        const key = prompt('Enter the encryption key for this file:');
        if (!key) return;
        const encryptedContent = await fetchFromIPFS(cid);
        const decrypted = await decryptFile(encryptedContent, key);
        const blob = new Blob([decrypted]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed');
      }
    };
    if (token) download();
  }, [token, writeContract]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Downloading...</h1>
      <p>Please wait while your file is being downloaded.</p>
    </div>
  );
}