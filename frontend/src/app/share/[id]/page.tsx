'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWriteContract, useReadContract, useEnsName } from 'wagmi';
import { readContract } from 'wagmi/actions';
import contractData from '@/contract/SFS.json';
import { getKey } from '@/utils/keyManager';
import EthCrypto from 'eth-crypto';

export default function SharePage() {
  const params = useParams();
  const fileId = params.id as string;
  const [userAddress, setUserAddress] = useState('');
  const [duration, setDuration] = useState(24); // hours
  const [tokenDuration, setTokenDuration] = useState(1); // hours
  const { writeContract } = useWriteContract();

  const { data: sharedUsers } = useReadContract({
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'fileSharedWith',
    args: [BigInt(fileId)],
  });

  const { data: fileData } = useReadContract({
    address: contractData.address as `0x${string}`,
    abi: contractData.abi,
    functionName: 'getFile',
    args: [BigInt(fileId)],
  });

  const handleGrantAccess = async () => {
    if (!userAddress || !fileData) return;
    const fileTuple = fileData as [string, string, bigint, `0x${string}`, bigint];
    const fileName = fileTuple[0];
    const key = getKey(fileName);
    if (!key) {
      alert('Encryption key not found');
      return;
    }
    const pubKeyBytes = await readContract({
      address: contractData.address as `0x${string}`,
      abi: contractData.abi,
      functionName: 'publicKeys',
      args: [userAddress as `0x${string}`],
    }) as Uint8Array;
    if (!pubKeyBytes || pubKeyBytes.length === 0) {
      alert('User has not set a public key');
      return;
    }
    const pubKeyHex = '0x' + Array.from(pubKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const compressedPubKey = EthCrypto.publicKey.compress(pubKeyHex);
    const encryptedKey = await EthCrypto.encryptWithPublicKey(compressedPubKey, key);
    const encryptedKeyStr = JSON.stringify(encryptedKey);
    writeContract({
      address: contractData.address as `0x${string}`,
      abi: contractData.abi,
      functionName: 'grantAccess',
      args: [BigInt(fileId), userAddress as `0x${string}`, BigInt(duration * 3600), encryptedKeyStr],
    });
    alert('Access granted with encrypted key!');
    setUserAddress('');
  };

  const handleRevokeAccess = (address: string) => {
    writeContract({
      address: contractData.address as `0x${string}`,
      abi: contractData.abi,
      functionName: 'revokeAccess',
      args: [BigInt(fileId), address as `0x${string}`],
    });
    alert('Access revoked!');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Share File {fileId}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Grant Access</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Address
          </label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Duration (hours)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button
          onClick={handleGrantAccess}
          disabled={!userAddress}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300"
        >
          Grant Access
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate One-Time Download Token</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Duration (hours)
          </label>
          <input
            type="number"
            value={tokenDuration}
            onChange={(e) => setTokenDuration(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button
          onClick={() => {
            writeContract({
              address: contractData.address as `0x${string}`,
              abi: contractData.abi,
              functionName: 'generateToken',
              args: [BigInt(fileId), BigInt(tokenDuration * 3600)],
            });
            alert('Token generated! Check transaction for token hash.');
          }}
          className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
        >
          Generate Token
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Users with Access</h2>
        {sharedUsers && (sharedUsers as `0x${string}`[]).length > 0 ? (
          <ul className="space-y-2">
            {(sharedUsers as `0x${string}`[]).map((address, index) => (
              <li key={index} className="flex justify-between items-center p-2 border rounded">
                <span className="font-mono text-sm">{address}</span>
                <button
                  onClick={() => handleRevokeAccess(address)}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 text-sm"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No users have access yet.</p>
        )}
      </div>
    </div>
  );
}