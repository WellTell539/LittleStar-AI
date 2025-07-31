const hre = require("hardhat");

async function main() {
  console.log("Testing contracts locally...\n");

  // Get signers
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);

  // Deploy ClaudeMiniSBT
  console.log("\nDeploying ClaudeMiniSBT...");
  const ClaudeMiniSBT = await hre.ethers.getContractFactory("ClaudeMiniSBT");
  const claudeMiniSBT = await ClaudeMiniSBT.deploy();
  await claudeMiniSBT.waitForDeployment();
  const sbtAddress = await claudeMiniSBT.getAddress();
  console.log("ClaudeMiniSBT deployed to:", sbtAddress);

  // Deploy MemoryAnchor
  console.log("\nDeploying MemoryAnchor...");
  const MemoryAnchor = await hre.ethers.getContractFactory("MemoryAnchor");
  const memoryAnchor = await MemoryAnchor.deploy(sbtAddress);
  await memoryAnchor.waitForDeployment();
  console.log("MemoryAnchor deployed to:", await memoryAnchor.getAddress());

  // Deploy GoalDAO
  console.log("\nDeploying GoalDAO...");
  const GoalDAO = await hre.ethers.getContractFactory("GoalDAO");
  const goalDAO = await GoalDAO.deploy(sbtAddress);
  await goalDAO.waitForDeployment();
  console.log("GoalDAO deployed to:", await goalDAO.getAddress());

  // Test minting
  console.log("\n--- Testing NFT Minting ---");
  const tx1 = await claudeMiniSBT.connect(user1).mintClaudeMini(
    "Alice's LITTLE STAR AI",
    "ipfs://test-uri-1"
  );
  await tx1.wait();
  console.log("User1 minted LITTLE STAR AI NFT");

  const tokenId = await claudeMiniSBT.getClaudeMiniByOwner(user1.address);
  console.log("User1's token ID:", tokenId.toString());

  // Test attributes
  const attrs = await claudeMiniSBT.claudeMiniAttributes(tokenId);
  console.log("Initial attributes:", {
    name: attrs.name,
    curiosity: attrs.curiosity.toString(),
    creativity: attrs.creativity.toString()
  });

  // Test memory anchoring
  console.log("\n--- Testing Memory Anchoring ---");
  const tx2 = await memoryAnchor.connect(user1).anchorMemory(
    "Today I learned about smart contracts!",
    "learning",
    "blockchain"
  );
  await tx2.wait();
  console.log("Memory anchored successfully");

  // Test goal proposal
  console.log("\n--- Testing Goal DAO ---");
  const tx3 = await claudeMiniSBT.connect(user2).mintClaudeMini(
    "Bob's LITTLE STAR AI",
    "ipfs://test-uri-2"
  );
  await tx3.wait();
  console.log("User2 minted LITTLE STAR AI NFT");

  const tx4 = await goalDAO.connect(user1).proposeGoal(
    "Learn Solidity",
    "Master smart contract development in 30 days"
  );
  await tx4.wait();
  console.log("Goal proposed successfully");

  // Vote on goal
  const tx5 = await goalDAO.connect(user2).voteOnGoal(0, true);
  await tx5.wait();
  console.log("User2 voted on the goal");

  console.log("\n✅ All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 