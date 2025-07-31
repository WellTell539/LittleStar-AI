const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClaudeMiniSBT", function () {
  let claudeMiniSBT;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ClaudeMiniSBT = await ethers.getContractFactory("ClaudeMiniSBT");
    claudeMiniSBT = await ClaudeMiniSBT.deploy();
    await claudeMiniSBT.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint a LITTLE STAR AI NFT", async function () {
      const name = "My LITTLE STAR AI";
      const uri = "ipfs://test-uri";
      
      await expect(claudeMiniSBT.connect(user1).mintClaudeMini(name, uri))
        .to.emit(claudeMiniSBT, "ClaudeMiniMinted")
        .withArgs(user1.address, 0, name);
      
      expect(await claudeMiniSBT.ownerOf(0)).to.equal(user1.address);
      expect(await claudeMiniSBT.tokenURI(0)).to.equal(uri);
    });

    it("Should prevent minting more than one NFT per address", async function () {
      await claudeMiniSBT.connect(user1).mintClaudeMini("First", "uri1");
      
      await expect(
        claudeMiniSBT.connect(user1).mintClaudeMini("Second", "uri2")
      ).to.be.revertedWith("Address has already minted a LITTLE STAR AI");
    });

    it("Should require a non-empty name", async function () {
      await expect(
        claudeMiniSBT.connect(user1).mintClaudeMini("", "uri")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });

  describe("Attributes", function () {
    beforeEach(async function () {
      await claudeMiniSBT.connect(user1).mintClaudeMini("Test Mini", "uri");
    });

    it("Should initialize attributes correctly", async function () {
      const attrs = await claudeMiniSBT.claudeMiniAttributes(0);
      
      expect(attrs.name).to.equal("Test Mini");
      expect(attrs.curiosity).to.equal(70);
      expect(attrs.creativity).to.equal(65);
      expect(attrs.empathy).to.equal(80);
      expect(attrs.analyticalThinking).to.equal(75);
      expect(attrs.emotionalIntelligence).to.equal(72);
    });

    it("Should allow owner to update attributes", async function () {
      await expect(
        claudeMiniSBT.connect(user1).updateAttributes(0, 80, 85, 90, 85, 80)
      ).to.emit(claudeMiniSBT, "AttributesUpdated");
      
      const attrs = await claudeMiniSBT.claudeMiniAttributes(0);
      expect(attrs.curiosity).to.equal(80);
      expect(attrs.creativity).to.equal(85);
    });

    it("Should prevent non-owners from updating attributes", async function () {
      await expect(
        claudeMiniSBT.connect(user2).updateAttributes(0, 80, 85, 90, 85, 80)
      ).to.be.revertedWith("Only token owner can update attributes");
    });

    it("Should validate attribute values", async function () {
      await expect(
        claudeMiniSBT.connect(user1).updateAttributes(0, 101, 85, 90, 85, 80)
      ).to.be.revertedWith("Attributes must be between 0 and 100");
    });
  });

  describe("Soulbound", function () {
    beforeEach(async function () {
      await claudeMiniSBT.connect(user1).mintClaudeMini("Test Mini", "uri");
    });

    it("Should prevent transfers", async function () {
      await expect(
        claudeMiniSBT.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWith("Soulbound tokens cannot be transferred");
    });

    it("Should prevent safeTransfers", async function () {
      await expect(
        claudeMiniSBT.connect(user1)["safeTransferFrom(address,address,uint256)"](
          user1.address, 
          user2.address, 
          0
        )
      ).to.be.revertedWith("Soulbound tokens cannot be transferred");
    });
  });

  describe("Queries", function () {
    it("Should get LITTLE STAR AI by owner", async function () {
      await claudeMiniSBT.connect(user1).mintClaudeMini("Test Mini", "uri");
      
      const tokenId = await claudeMiniSBT.getClaudeMiniByOwner(user1.address);
      expect(tokenId).to.equal(0);
    });

    it("Should revert if no LITTLE STAR AI found for address", async function () {
      await expect(
        claudeMiniSBT.getClaudeMiniByOwner(user1.address)
      ).to.be.revertedWith("No LITTLE STAR AI found for this address");
    });
  });
}); 