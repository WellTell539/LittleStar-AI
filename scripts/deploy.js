const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy ClaudeMiniSBT
  const ClaudeMiniSBT = await hre.ethers.getContractFactory("ClaudeMiniSBT");
  const claudeMiniSBT = await ClaudeMiniSBT.deploy();
  await claudeMiniSBT.waitForDeployment();
  const sbtAddress = await claudeMiniSBT.getAddress();
  console.log("ClaudeMiniSBT deployed to:", sbtAddress);

  // Deploy MemoryAnchor
  const MemoryAnchor = await hre.ethers.getContractFactory("MemoryAnchor");
  const memoryAnchor = await MemoryAnchor.deploy(sbtAddress);
  await memoryAnchor.waitForDeployment();
  const memoryAddress = await memoryAnchor.getAddress();
  console.log("MemoryAnchor deployed to:", memoryAddress);

  // Deploy GoalDAO
  const GoalDAO = await hre.ethers.getContractFactory("GoalDAO");
  const goalDAO = await GoalDAO.deploy(sbtAddress);
  await goalDAO.waitForDeployment();
  const daoAddress = await goalDAO.getAddress();
  console.log("GoalDAO deployed to:", daoAddress);

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contracts: {
      ClaudeMiniSBT: sbtAddress,
      MemoryAnchor: memoryAddress,
      GoalDAO: daoAddress,
    },
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment completed! Contract addresses saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 