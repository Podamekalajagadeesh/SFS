const hre = require("hardhat");

async function main() {
  console.log("Deploying SFS contract...");

  const SFS = await hre.ethers.getContractFactory("SFS");
  const sfs = await SFS.deploy();
  await sfs.waitForDeployment();

  const address = await sfs.getAddress();
  console.log("SFS contract deployed to:", address);

  // Save the contract address and ABI for frontend
  const fs = require("fs");
  const contractData = {
    address: address,
    abi: SFS.interface.format('json')
  };
  fs.writeFileSync("../frontend/src/contract/SFS.json", JSON.stringify(contractData, null, 2));
  console.log("Contract address and ABI saved to frontend/src/contract/SFS.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
