// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SFS is Ownable {
    struct File {
        string name;
        string cid;
        uint256 size;
        address owner;
        uint256 downloadCount;
    }

    mapping(uint256 => mapping(address => uint256)) public accessExpiry; // expiry timestamp, 0 means no access
    mapping(uint256 => address[]) public fileSharedWith;
    mapping(string => bool) private uploadedCIDs;
    mapping(address => uint256[]) public ownerFiles;
    mapping(bytes32 => uint256) public tokenToFile;
    mapping(bytes32 => uint256) public tokenExpiry;
    mapping(uint256 => mapping(address => string)) public encryptedKeys; // encrypted encryption key for user
    mapping(address => bytes) public publicKeys; // user's public key for encryption

    uint256 public nextFileId = 1;

    modifier onlyFileOwner(uint256 fileId) {
        require(files[fileId].owner == msg.sender, "Not the file owner");
        _;
    }

    modifier hasAccess(uint256 fileId) {
        require(checkAccess(fileId, msg.sender), "No access to file");
        _;
    }

    event FileUploaded(uint256 indexed fileId, address indexed owner, string name, string cid, uint256 size);
    event AccessGranted(uint256 indexed fileId, address indexed user);
    event AccessRevoked(uint256 indexed fileId, address indexed user);
    event FileDownloaded(uint256 indexed fileId, address indexed user);

    function uploadFile(string memory name, string memory cid, uint256 size) public {
        require(!uploadedCIDs[cid], "CID already uploaded");
        uint256 fileId = nextFileId++;
        files[fileId] = File(name, cid, size, msg.sender, 0);
        ownerFiles[msg.sender].push(fileId);
        uploadedCIDs[cid] = true;
        emit FileUploaded(fileId, msg.sender, name, cid, size);
    }

    function grantAccess(uint256 fileId, address user, uint256 durationSeconds, string memory encryptedKey) public onlyFileOwner(fileId) {
        accessExpiry[fileId][user] = block.timestamp + durationSeconds;
        encryptedKeys[fileId][user] = encryptedKey;
        bool alreadyShared = false;
        for (uint i = 0; i < fileSharedWith[fileId].length; i++) {
            if (fileSharedWith[fileId][i] == user) {
                alreadyShared = true;
                break;
            }
        }
        if (!alreadyShared) {
            fileSharedWith[fileId].push(user);
        }
        emit AccessGranted(fileId, user);
    }

    function revokeAccess(uint256 fileId, address user) public onlyFileOwner(fileId) {
        accessExpiry[fileId][user] = 0;
        delete encryptedKeys[fileId][user];
        emit AccessRevoked(fileId, user);
    }

    function checkAccess(uint256 fileId, address user) public view returns (bool) {
        return (accessExpiry[fileId][user] > block.timestamp && accessExpiry[fileId][user] != 0) || files[fileId].owner == user;
    }

    function getFile(uint256 fileId) public view hasAccess(fileId) returns (File memory) {
        return files[fileId];
    }

    function downloadFile(uint256 fileId) public hasAccess(fileId) {
        files[fileId].downloadCount++;
        emit FileDownloaded(fileId, msg.sender);
    }

    function setPublicKey(bytes memory pubKey) public {
        publicKeys[msg.sender] = pubKey;
    }

    function generateToken(uint256 fileId, uint256 durationSeconds) public onlyFileOwner(fileId) returns (bytes32) {
        bytes32 token = keccak256(abi.encodePacked(msg.sender, fileId, block.timestamp, block.prevrandao));
        tokenToFile[token] = fileId;
        tokenExpiry[token] = block.timestamp + durationSeconds;
        emit TokenGenerated(token, fileId, tokenExpiry[token]);
        return token;
    }

    event TokenGenerated(bytes32 indexed token, uint256 indexed fileId, uint256 expiry);

    function downloadWithToken(bytes32 token) public {
        require(tokenToFile[token] != 0, "Invalid token");
        require(tokenExpiry[token] > block.timestamp, "Token expired");
        uint256 fileId = tokenToFile[token];
        files[fileId].downloadCount++;
        emit FileDownloaded(fileId, msg.sender);
        delete tokenToFile[token];
        delete tokenExpiry[token];
    }
}