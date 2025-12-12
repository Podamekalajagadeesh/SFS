import { NFTStorage } from 'nft.storage';

// Initialize NFT.Storage client with API key from environment
const apiKey = process.env.NFT_STORAGE_API_KEY;
if (!apiKey) {
  throw new Error('NFT_STORAGE_API_KEY is not set in environment variables');
}

export const nftStorageClient = new NFTStorage({ token: apiKey });

// Function to upload a file to NFT.Storage (IPFS/Filecoin)
export async function uploadToNFTStorage(file: File): Promise<string> {
  try {
    const cid = await nftStorageClient.storeBlob(file);
    return cid;
  } catch (error) {
    console.error('Failed to upload to NFT.Storage:', error);
    throw error;
  }
}

// Function to upload multiple files or metadata
export async function uploadMetadataToNFTStorage(metadata: any): Promise<string> {
  try {
    const cid = await nftStorageClient.store(metadata);
    return cid;
  } catch (error) {
    console.error('Failed to upload metadata to NFT.Storage:', error);
    throw error;
  }
}

// Function to fetch encrypted file data from IPFS using CID
export async function fetchFromIPFS(cid: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`https://${cid}.ipfs.nftstorage.link/`);
    if (!response.ok) {
      throw new Error('Failed to fetch from IPFS');
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error('Failed to fetch from IPFS:', error);
    throw error;
  }
}