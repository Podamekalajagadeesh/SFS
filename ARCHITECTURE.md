# 🔐 SFS — Secure File Sharing Using Blockchain

## Architecture Documentation


---

## 📌 1. Project Overview

SFS (Secure File Sharing Using Blockchain) is a decentralized file-sharing system where:

- Files are encrypted locally before uploading
- Encrypted files are stored on IPFS/Filecoin
- File metadata is stored on the Ethereum Sepolia testnet
- Access to files is managed via smart contracts
- Only authorized users with the correct AES key can decrypt and view/download files

This ensures maximum privacy, zero trust, and tamper-proof sharing.

---

## 📌 2. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  - Upload UI        - My Files Dashboard    - Access Control │
│  - Encryption/Decryption (Client-side)      - File Viewer    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
───────────── Blockchain Layer (Ethereum Sepolia) ─────────────
│ Smart Contract (SFS.sol)                                     │
│ - store CID                                                  │
│ - access control mapping                                     │
│ - grant/revoke access                                        │
│ - events for activity logs                                   │
─────────────────────────────┬──────────────────────────────────
                              │
                              ▼
──────────── Decentralized Storage Layer (IPFS/Filecoin) ──────
│ - Stores encrypted files as content-addressed CIDs           │
│ - Files cannot be altered without changing the CID           │
─────────────────────────────┬──────────────────────────────────
                              │
                              ▼
─────────────── Client Device (End User) ───────────────────────
│ - Holds encryption keys locally                              │
│ - Performs AES-256 encryption and decryption                 │
│ - No keys sent to IPFS or blockchain                         │
───────────────────────────────────────────────────────────────
```

---

## 📌 3. System Components

### 3.1 Frontend (Next.js + Wagmi + RainbowKit)

- User authentication via wallet
- File upload UI
- File encryption using AES-256
- IPFS upload + fetching
- Interaction with smart contract
- Access management UI
- File decryption + download

**Tech Stack:**

- Next.js 14
- Tailwind CSS
- Wagmi + Viem
- RainbowKit
- CryptoJS / Web Crypto API
- NFT.Storage 

---

### 3.2 Smart Contract Layer (Solidity + Hardhat)

**Responsibilities:**

- Store encrypted file metadata (CID + Owner)
- Provide permission-based access control
- Emit events for actions
- Verify access before file decryption

**Main Functions:**

- uploadFile(cid)
- grantAccess(fileId, user)
- revokeAccess(fileId, user)
- checkAccess(fileId, user)
- getFilesByOwner(address)
- getFilesSharedWith(address)

**Deployment:**

- Ethereum Sepolia Testnet
- Hardhat deployment scripts
- Verified on Etherscan

---

### 3.3 Decentralized Storage Layer (IPFS/Filecoin)

**Responsibilities:**

- Store encrypted file data
- Generate CID (content identifier)
- Provide decentralized retrieval via IPFS gateways

**Features:**

- No server needed
- Tamper-proof
- Censorship-resistant
- CID uniquely represents content

---

### 3.4 Encryption Layer (Local Only)

**Encryption:**

- AES-256-GCM
- Key generated per file
- File encrypted before upload

**Decryption:**

- User enters key
- Encrypted file fetched from IPFS
- Decrypted on client device

**Security Note:**

Keys are never stored on the blockchain or IPFS.

#### Module 1: AES Encryption

**Tasks Completed:**

1. Installed CryptoJS for Node.js environments (smart-contract scripts) and utilized Web Crypto API for browser (frontend).
2. Created `encryptFile(file)` function:
   - Frontend: Takes a `File` object, generates random AES-256-GCM key, converts file to `ArrayBuffer`, encrypts, returns `{ encryptedData: ArrayBuffer, encryptionKey: string }`.
   - Smart-Contract: Takes a file path, reads file, generates key, encrypts, returns `{ encryptedData: string (hex), encryptionKey: string (base64) }`.
3. Generates random AES-256-GCM key using secure random generation.
4. Converts file/buffer to appropriate format and encrypts.
5. Returns encrypted data and key.

**Implementation Locations:**
- Frontend: `/workspaces/SFS/frontend/src/utils/encryption.ts`
- Smart-Contract: `/workspaces/SFS/smart-contract/scripts/encryptFile.js`

#### Module 2: AES Decryption

**Tasks Completed:**

1. Created `decryptFile(encryptedData, key)` function:
   - Frontend: Takes `ArrayBuffer` and key string, separates IV, imports key, decrypts, returns original `ArrayBuffer`.
   - Smart-Contract: Takes hex string and base64 key, separates IV, decrypts, returns `Buffer`.
2. Converts buffer → decrypt → restore original data.
3. Tested decryption for image, PDF, MP4, and text file types using a test script that encrypts and decrypts sample data, verifying integrity.

**Implementation Locations:**
- Frontend: `/workspaces/SFS/frontend/src/utils/encryption.ts`
- Smart-Contract: `/workspaces/SFS/smart-contract/scripts/encryptFile.js` and `/workspaces/SFS/smart-contract/scripts/testDecrypt.js`

#### Module 3: Key Management

**Tasks Completed:**

1. Keys are never stored on the blockchain (ensured by local-only encryption/decryption).
2. Keys are stored in localStorage (with option for indexedDB in future; localStorage used for simplicity).
3. Added option to export keys as downloadable text files.
4. Added input box in the download UI to enter the encryption key during file decryption.

**Implementation Locations:**
- Key utilities: `/workspaces/SFS/frontend/src/utils/keyManager.ts`
- UI integration: `/workspaces/SFS/frontend/src/app/page.tsx`

#### Module 1: Integration Setup

**Tasks Completed:**

1. Installed NFT.Storage SDK (`nft.storage` package added to dependencies).
2. Added NFT.Storage API key to `.env.local` (already present in the file).
3. Initialized NFT.Storage client in `/workspaces/SFS/frontend/src/utils/nftStorage.ts` with the API key from environment variables.

**Additional Features:**
- `uploadToNFTStorage(file)`: Uploads a file/blob to IPFS/Filecoin and returns the CID.
- Integrated into the upload flow in the UI to automatically upload encrypted files to NFT.Storage.

#### Module 1: Layouts + UI

**Tasks Completed:**

1. TailwindCSS is installed and configured in the Next.js project.
2. Built layout components including:
   - `Navbar` component with navigation links and wallet connection.
   - Updated `RootLayout` with Wagmi and RainbowKit providers for blockchain integration.
3. Created pages:
   - `/upload`: Dedicated upload page with file selection and encryption.
   - `/my-files`: Page to view user's uploaded files (placeholder for now).
   - `/shared-with-me`: Page for files shared with the user (placeholder).
   - `/file/[id]`: Dynamic page to view file details and actions.
   - `/share/[id]`: Dynamic page to grant/revoke access to a file.

**Implementation Locations:**
- Layout: `/workspaces/SFS/frontend/src/app/layout.tsx` and `/workspaces/SFS/frontend/src/components/Navbar.tsx`
- Providers: `/workspaces/SFS/frontend/src/app/providers.tsx` and `/workspaces/SFS/frontend/src/wagmi.ts`
- Pages: Various in `/workspaces/SFS/frontend/src/app/`
#### Module 2: Wallet Connection

**Tasks Completed:**

1. Added RainbowKit provider in the root layout with Wagmi configuration.
2. Added Connect Wallet button via RainbowKit's `ConnectButton` in the navbar.
3. The ConnectButton shows the connected wallet address in the header when connected.
4. All pages are blocked unless the wallet is connected, using a `WalletGuard` component that shows a connection prompt.

**Implementation Locations:**
- Providers: `/workspaces/SFS/frontend/src/app/providers.tsx` and `/workspaces/SFS/frontend/src/wagmi.ts`
- Navbar: `/workspaces/SFS/frontend/src/components/Navbar.tsx`
- Wallet Guard: `/workspaces/SFS/frontend/src/components/WalletGuard.tsx`
- Layout: `/workspaces/SFS/frontend/src/app/layout.tsx`
#### Module 2: Upload Workflow

**Tasks Completed:**

1. Encrypt file using AES-256-GCM.
2. Convert encrypted ArrayBuffer into a Blob, then implicitly handle as File for upload.
3. Upload the encrypted blob to NFT.Storage.
4. Retrieve the CID from the upload response.
5. Call the smart contract's `uploadFile(name, cid, size)` function to store metadata on the blockchain.

**Implementation Locations:**
- Workflow integration: `/workspaces/SFS/frontend/src/app/page.tsx`
- Smart contract updates: `/workspaces/SFS/smart-contract/contracts/SFS.sol` (modified to use string CID instead of bytes32 hash)
- Contract ABI: `/workspaces/SFS/frontend/src/contract/SFS.json` (updated to match new contract)

#### Module 3: Upload Page

**Tasks Completed:**

1. Added drag & drop component with visual feedback for file selection.
2. Encrypt file using AES-256-GCM before upload.
3. Upload encrypted file to NFT.Storage (IPFS).
4. Store CID in the smart contract via `uploadFile` function.
5. Show success message with fileId and CID after upload.

**Implementation Locations:**
- Upload page: `/workspaces/SFS/frontend/src/app/upload/page.tsx` (enhanced with drag & drop and success display)

#### Module 4: My Files

**Tasks Completed:**

1. Read file metadata from blockchain using `ownerFiles` mapping and `files` mapping.
2. Display file list with Name, CID, Size, and Actions (Download, Share Access).
3. Added Download button that fetches from IPFS, decrypts with local key, and downloads.
4. Added Share Access button linking to the share page.

**Implementation Locations:**
- My Files page: `/workspaces/SFS/frontend/src/app/my-files/page.tsx`
- Smart contract updates: `/workspaces/SFS/smart-contract/contracts/SFS.sol` (added `ownerFiles` mapping and population)

#### Module 5: Shared With Me

**Tasks Completed:**

1. Load all files by iterating from file ID 1 to `nextFileId - 1`.
2. Filter files using the `checkAccess(fileId, user)` contract function.
3. Display only files accessible to the connected user, showing name, CID, size, owner, and actions (Download, View Details).

**Implementation Locations:**
- Shared with Me page: `/workspaces/SFS/frontend/src/app/shared-with-me/page.tsx`

#### Module 6: Sharing Access

**Tasks Completed:**

1. Input field for entering Ethereum wallet address.
2. Call `grantAccess(fileId, user)` on the smart contract when granting access.
3. Display list of users with access using `fileSharedWith[fileId]` array.
4. Revoke button next to each address that calls `revokeAccess(fileId, user)`.

**Implementation Locations:**
- Share page: `/workspaces/SFS/frontend/src/app/share/[id]/page.tsx`
- Smart contract updates: `/workspaces/SFS/smart-contract/contracts/SFS.sol` (added `fileSharedWith` mapping and population)

---

## 📌 4. Data Flow Architecture

### 1. User Uploads File

User selects file → Browser encrypts file → Encrypted file uploaded to IPFS → IPFS returns CID → Smart contract stores CID + metadata → Dashboard updates

---

### 2. Grant File Access

Owner enters target wallet address → Call grantAccess(fileId, user) → Smart contract updates permission mapping → Blockchain logs event → UI updates access list

---

### 3. File Download

User selects file → Smart contract checks access → If access allowed: Fetch encrypted file from IPFS → Ask user for AES key → Decrypt locally → Download original file

---

## 📌 5. Contract Architecture

**State Variables**

- mapping(uint => File) public files;
- mapping(uint => mapping(address => bool)) public accessList;
- uint public fileCount;

**Struct**

```solidity
struct File {
    address owner;
    string cid;
    uint timestamp;
}
```

**Events**

- FileUploaded
- AccessGranted
- AccessRevoked
- FileDownloaded

---

## 📌 6. Frontend Architecture

```
/frontend
├── components
│   ├── UploadBox.jsx
│   ├── FileCard.jsx
│   ├── AccessList.jsx
│   └── DownloadModal.jsx
├── lib
│   ├── encryption.js
│   ├── storage.js
│   └── contract.js
├── pages
│   ├── upload.jsx
│   ├── my-files.jsx
│   ├── shared.jsx
│   └── file/[id].jsx
├── styles
└── public
```

---

## 📌 7. Smart Contract Architecture

```
/smart-contract
├── contracts
│   └── SFS.sol
├── scripts
│   └── deploy.js
├── test
│   └── sfs.test.js
├── hardhat.config.js
└── package.json
```

---

## 📌 8. Sequence Diagrams

### 8.1 File Upload Flow

User → Frontend: select file  
Frontend → Encryption: AES encrypt  
Frontend → IPFS: upload encrypted file  
IPFS → Frontend: return CID  
Frontend → Smart Contract: uploadFile(CID)  
Smart Contract → Blockchain: store metadata  
Frontend → User: upload success

---

### 8.2 File Access Grant

Owner → Frontend: Share file with address  
Frontend → Smart Contract: grantAccess  
Smart Contract → Blockchain: update access map  
Frontend → Owner: Access granted

---

### 8.3 File Download Flow

User → Smart Contract: request access  
Smart Contract → User: allowed/not allowed  
If allowed:  
User → IPFS: fetch encrypted file  
User → Frontend: enter decryption key  
Frontend → User: decrypted original file

---

## 📌 9. Security Model

- ✔ Client-side encryption: No file is ever uploaded unencrypted.
- ✔ AES keys are not stored: Only the user holds the key.
- ✔ Smart contract enforces access: Cannot download/decrypt without permission.
- ✔ IPFS ensures immutability: Data cannot be tampered with.
- ✔ Blockchain ensures transparency: All access changes are logged.

---

## 📌 10. Tech Stack Summary

| Layer       | Technology                 |
|-------------|----------------------------|
| Blockchain  | Solidity, Hardhat, Ethereum|
| Storage     | IPFS, NFT.Storage          |
| Frontend    | Next.js, TailwindCSS       |
| Wallet      | MetaMask, RainbowKit       |
| Encryption  | AES-256-GCM (WebCrypto)    |

---

## 📌 11. Final Notes

This architecture is:

- ✔ Scalable
- ✔ Secure
- ✔ Decentralized
- ✔ Privacy-preserving
- ✔ Perfect for real-world usage and portfolio

---
.</content>
<parameter name="filePath">/workspaces/SFS/ARCHITECTURE.md