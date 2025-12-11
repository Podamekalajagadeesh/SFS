const { ethers } = require("hardhat");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("PRIVATE_KEY not set");
    return;
  }
  const wallet = new ethers.Wallet(privateKey);
  console.log("Deployer address:", wallet.address);
}

main();