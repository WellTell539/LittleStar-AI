// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClaudeMiniSBT
 * @dev Soulbound Token (SBT) for LITTLE STAR AI's digital identity
 * These tokens are non-transferable and represent unique LITTLE STAR AI instances
 */
contract ClaudeMiniSBT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping to track if an address has already minted
    mapping(address => bool) public hasMinted;
    
    // Mapping to track LITTLE STAR AI attributes
    mapping(uint256 => ClaudeMiniAttributes) public claudeMiniAttributes;
    
    struct ClaudeMiniAttributes {
        string name;
        uint256 createdAt;
        uint256 curiosity;
        uint256 creativity;
        uint256 empathy;
        uint256 analyticalThinking;
        uint256 emotionalIntelligence;
    }
    
    event ClaudeMiniMinted(address indexed owner, uint256 indexed tokenId, string name);
    event AttributesUpdated(uint256 indexed tokenId, ClaudeMiniAttributes attributes);
    
    constructor() ERC721("LITTLE STAR AI SBT", "CMSBT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new LITTLE STAR AI SBT
     * Each address can only mint one SBT
     */
    function mintClaudeMini(string memory name, string memory uri) public {
        require(!hasMinted[msg.sender], "Address has already minted a LITTLE STAR AI");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Initialize attributes
        claudeMiniAttributes[tokenId] = ClaudeMiniAttributes({
            name: name,
            createdAt: block.timestamp,
            curiosity: 70,
            creativity: 65,
            empathy: 80,
            analyticalThinking: 75,
            emotionalIntelligence: 72
        });
        
        hasMinted[msg.sender] = true;
        
        emit ClaudeMiniMinted(msg.sender, tokenId, name);
    }
    
    /**
     * @dev Update LITTLE STAR AI attributes (only token owner can update)
     */
    function updateAttributes(
        uint256 tokenId,
        uint256 curiosity,
        uint256 creativity,
        uint256 empathy,
        uint256 analyticalThinking,
        uint256 emotionalIntelligence
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can update attributes");
        require(curiosity <= 100 && creativity <= 100 && empathy <= 100 && 
                analyticalThinking <= 100 && emotionalIntelligence <= 100, 
                "Attributes must be between 0 and 100");
        
        ClaudeMiniAttributes storage attrs = claudeMiniAttributes[tokenId];
        attrs.curiosity = curiosity;
        attrs.creativity = creativity;
        attrs.empathy = empathy;
        attrs.analyticalThinking = analyticalThinking;
        attrs.emotionalIntelligence = emotionalIntelligence;
        
        emit AttributesUpdated(tokenId, attrs);
    }
    
    /**
     * @dev Get LITTLE STAR AI by owner address
     */
    function getClaudeMiniByOwner(address owner) public view returns (uint256) {
        uint256 totalSupply = _tokenIdCounter;
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_ownerOf(i) == owner) {
                return i;
            }
        }
        revert("No LITTLE STAR AI found for this address");
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Override transfer functions to make tokens soulbound (non-transferable)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting and burning, but not transfers
        require(from == address(0) || to == address(0), "Soulbound tokens cannot be transferred");
        
        return super._update(to, tokenId, auth);
    }
    
    // The following functions are overrides required by Solidity
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 