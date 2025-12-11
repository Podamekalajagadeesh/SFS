// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SFS is Ownable {
    struct File {
        string name;
        bytes32 hash;
        uint256 size;
        address owner;
    }

    mapping(uint256 => File) public files;
    mapping(uint256 => mapping(address => bool)) public access;
    mapping(bytes32 => bool) private uploadedHashes;

    uint256 public nextFileId = 1;

    modifier onlyFileOwner(uint256 fileId) {
        require(files[fileId].owner == msg.sender, "Not the file owner");
        _;
    }

    modifier hasAccess(uint256 fileId) {
        require(checkAccess(fileId, msg.sender), "No access to file");
        _;
    }

    event FileUploaded(uint256 indexed fileId, address indexed owner, string name, bytes32 hash, uint256 size);
    event AccessGranted(uint256 indexed fileId, address indexed user);
    event AccessRevoked(uint256 indexed fileId, address indexed user);
    event FileDownloaded(uint256 indexed fileId, address indexed user);

    function uploadFile(string memory name, bytes32 hash, uint256 size) public {
        require(!uploadedHashes[hash], "File hash already uploaded");
        uint256 fileId = nextFileId++;
        files[fileId] = File(name, hash, size, msg.sender);
        uploadedHashes[hash] = true;
        emit FileUploaded(fileId, msg.sender, name, hash, size);
    }

    function grantAccess(uint256 fileId, address user) public onlyFileOwner(fileId) {
        access[fileId][user] = true;
        emit AccessGranted(fileId, user);
    }

    function revokeAccess(uint256 fileId, address user) public onlyFileOwner(fileId) {
        access[fileId][user] = false;
        emit AccessRevoked(fileId, user);
    }

    function checkAccess(uint256 fileId, address user) public view returns (bool) {
        return access[fileId][user] || files[fileId].owner == user;
    }

    function getFile(uint256 fileId) public view hasAccess(fileId) returns (File memory) {
        return files[fileId];
    }

    function downloadFile(uint256 fileId) public hasAccess(fileId) {
        emit FileDownloaded(fileId, msg.sender);
    }
}