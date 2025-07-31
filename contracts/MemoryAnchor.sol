// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ClaudeMiniSBT.sol";

/**
 * @title MemoryAnchor
 * @dev Contract to store memory hashes on blockchain and link them to LITTLE STAR AI NFTs
 */
contract MemoryAnchor {
    ClaudeMiniSBT public claudeMiniSBT;
    
    struct Memory {
        bytes32 memoryHash;
        uint256 timestamp;
        string memoryType; // "goal", "emotion", "learning"
        string category;
        bool exists;
    }
    
    // Mapping from tokenId to array of memory IDs
    mapping(uint256 => uint256[]) public tokenMemories;
    
    // Mapping from memory ID to Memory struct
    mapping(uint256 => Memory) public memories;
    
    // Counter for memory IDs
    uint256 public memoryCounter;
    
    event MemoryAnchored(
        uint256 indexed tokenId,
        uint256 indexed memoryId,
        bytes32 memoryHash,
        string memoryType,
        string category
    );
    
    event MemoryVerified(uint256 indexed memoryId, bool isValid);
    
    constructor(address _claudeMiniSBT) {
        claudeMiniSBT = ClaudeMiniSBT(_claudeMiniSBT);
    }
    
    /**
     * @dev Anchor a memory hash to the blockchain
     * @param memoryData The memory content to be hashed
     * @param memoryType Type of memory: "goal", "emotion", or "learning"
     * @param category Optional category for the memory
     */
    function anchorMemory(
        string memory memoryData,
        string memory memoryType,
        string memory category
    ) public returns (uint256) {
        // Get the caller's LITTLE STAR AI token ID
        uint256 tokenId = claudeMiniSBT.getClaudeMiniByOwner(msg.sender);
        
        // Create memory hash
        bytes32 memoryHash = keccak256(
            abi.encodePacked(
                memoryData,
                msg.sender,
                block.timestamp,
                memoryCounter
            )
        );
        
        // Store memory
        uint256 memoryId = memoryCounter++;
        memories[memoryId] = Memory({
            memoryHash: memoryHash,
            timestamp: block.timestamp,
            memoryType: memoryType,
            category: category,
            exists: true
        });
        
        // Link memory to token
        tokenMemories[tokenId].push(memoryId);
        
        emit MemoryAnchored(tokenId, memoryId, memoryHash, memoryType, category);
        
        return memoryId;
    }
    
    /**
     * @dev Verify a memory by checking its hash
     * @param memoryId The ID of the memory to verify
     * @param memoryData The original memory content
     * @param owner The owner address when the memory was created
     * @param timestamp The timestamp when the memory was created
     */
    function verifyMemory(
        uint256 memoryId,
        string memory memoryData,
        address owner,
        uint256 timestamp
    ) public view returns (bool) {
        require(memories[memoryId].exists, "Memory does not exist");
        
        bytes32 calculatedHash = keccak256(
            abi.encodePacked(
                memoryData,
                owner,
                timestamp,
                memoryId
            )
        );
        
        return memories[memoryId].memoryHash == calculatedHash;
    }
    
    /**
     * @dev Get all memory IDs for a specific LITTLE STAR AI token
     */
    function getTokenMemories(uint256 tokenId) public view returns (uint256[] memory) {
        return tokenMemories[tokenId];
    }
    
    /**
     * @dev Get memories by type for a specific token
     */
    function getMemoriesByType(
        uint256 tokenId,
        string memory memoryType
    ) public view returns (uint256[] memory) {
        uint256[] memory allMemories = tokenMemories[tokenId];
        uint256 count = 0;
        
        // First, count matching memories
        for (uint256 i = 0; i < allMemories.length; i++) {
            if (keccak256(bytes(memories[allMemories[i]].memoryType)) == 
                keccak256(bytes(memoryType))) {
                count++;
            }
        }
        
        // Create array of matching memories
        uint256[] memory matchingMemories = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allMemories.length; i++) {
            if (keccak256(bytes(memories[allMemories[i]].memoryType)) == 
                keccak256(bytes(memoryType))) {
                matchingMemories[index++] = allMemories[i];
            }
        }
        
        return matchingMemories;
    }
    
    /**
     * @dev Get memory count for a token
     */
    function getMemoryCount(uint256 tokenId) public view returns (uint256) {
        return tokenMemories[tokenId].length;
    }
} 