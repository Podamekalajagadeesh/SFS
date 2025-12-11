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