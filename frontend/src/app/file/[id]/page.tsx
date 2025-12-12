'use client';

import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import contractData from '@/contract/SFS.json';
import Link from 'next/link';

export default function FilePage() {
  const params = useParams();
  const fileId = params.id as string;

  const { data: fileData, isLoading } = useReadContract({
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'files',
    args: [BigInt(fileId)],
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Loading file details...</p>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>File not found.</p>
        </div>
      </div>
    );
  }

  const [name, cid, size, owner] = fileData as [string, string, bigint, `0x${string}`];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">File Details</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{name}</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>File ID:</strong> {fileId}</p>
          <p><strong>CID:</strong> {cid}</p>
          <p><strong>Size:</strong> {Number(size)} bytes</p>
          <p><strong>Owner:</strong> {owner}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <Link
            href={`/share/${fileId}`}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Share File
          </Link>
          <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}