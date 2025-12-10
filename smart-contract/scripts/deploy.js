const hre = require("hardhat");

async function main() {
  console.log("Deploying Counter contract...");

  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();

  const address = await counter.getAddress();
  console.log("Counter contract deployed to:", address);

  // Example interactions
  const count = await counter.getCount();
  console.log("Initial count:", count.toString());

  const tx = await counter.increment();
  await tx.wait();
  console.log("After increment:", (await counter.getCount()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
