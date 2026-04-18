// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GarlawsPropertyNFT
 * @dev ERC721 token contract for property tokenization
 * @notice This contract allows property owners to tokenize their real estate as NFTs
 */
contract GarlawsPropertyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct PropertyDetails {
        string address;
        uint256 size; // in square meters
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 yearBuilt;
        string propertyType; // Residential, Commercial, Industrial
        int256 latitude; // multiplied by 10^6 for precision
        int256 longitude; // multiplied by 10^6 for precision
        string suburb;
        string city;
        uint256 valuation; // in wei (smallest unit)
        uint256 lastValuationUpdate;
    }

    // Mapping from token ID to property details
    mapping(uint256 => PropertyDetails) private _propertyDetails;

    // Mapping for approved appraisers
    mapping(address => bool) private _approvedAppraisers;

    // Events
    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string propertyAddress);
    event PropertyValuationUpdated(uint256 indexed tokenId, uint256 newValuation, address updater);
    event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("Garlaws Property NFT", "GPROP") {}

    /**
     * @dev Mint a new property NFT
     * @param to The address that will own the minted token
     * @param propertyAddress The physical address of the property
     * @param size Property size in square meters
     * @param bedrooms Number of bedrooms
     * @param bathrooms Number of bathrooms
     * @param yearBuilt Year the property was built
     * @param propertyType Type of property (Residential/Commercial/Industrial)
     * @param latitude Property latitude (multiplied by 10^6)
     * @param longitude Property longitude (multiplied by 10^6)
     * @param suburb Property suburb
     * @param city Property city
     * @param initialValuation Initial property valuation in wei
     * @param tokenURI URI for the token metadata
     */
    function mintProperty(
        address to,
        string memory propertyAddress,
        uint256 size,
        uint256 bedrooms,
        uint256 bathrooms,
        uint256 yearBuilt,
        string memory propertyType,
        int256 latitude,
        int256 longitude,
        string memory suburb,
        string memory city,
        uint256 initialValuation,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _propertyDetails[tokenId] = PropertyDetails({
            address: propertyAddress,
            size: size,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            yearBuilt: yearBuilt,
            propertyType: propertyType,
            latitude: latitude,
            longitude: longitude,
            suburb: suburb,
            city: city,
            valuation: initialValuation,
            lastValuationUpdate: block.timestamp
        });

        emit PropertyMinted(tokenId, to, propertyAddress);
        return tokenId;
    }

    /**
     * @dev Update property valuation (only approved appraisers)
     * @param tokenId The token ID of the property
     * @param newValuation New valuation in wei
     */
    function updatePropertyValuation(uint256 tokenId, uint256 newValuation) public {
        require(_exists(tokenId), "Property does not exist");
        require(_approvedAppraisers[msg.sender] || msg.sender == owner(), "Not authorized to update valuation");

        _propertyDetails[tokenId].valuation = newValuation;
        _propertyDetails[tokenId].lastValuationUpdate = block.timestamp;

        emit PropertyValuationUpdated(tokenId, newValuation, msg.sender);
    }

    /**
     * @dev Get property details
     * @param tokenId The token ID
     * @return PropertyDetails struct
     */
    function getPropertyDetails(uint256 tokenId) public view returns (PropertyDetails memory) {
        require(_exists(tokenId), "Property does not exist");
        return _propertyDetails[tokenId];
    }

    /**
     * @dev Approve an appraiser
     * @param appraiser Address of the appraiser
     */
    function approveAppraiser(address appraiser) public onlyOwner {
        _approvedAppraisers[appraiser] = true;
    }

    /**
     * @dev Remove appraiser approval
     * @param appraiser Address of the appraiser
     */
    function revokeAppraiser(address appraiser) public onlyOwner {
        _approvedAppraisers[appraiser] = false;
    }

    /**
     * @dev Check if address is approved appraiser
     * @param appraiser Address to check
     * @return bool True if approved
     */
    function isApprovedAppraiser(address appraiser) public view returns (bool) {
        return _approvedAppraisers[appraiser];
    }

    /**
     * @dev Override transfer function to emit custom event
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        emit PropertyTransferred(tokenId, from, to);
    }

    /**
     * @dev Override safeTransferFrom function
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        super.safeTransferFrom(from, to, tokenId);
        emit PropertyTransferred(tokenId, from, to);
    }

    /**
     * @dev Override safeTransferFrom with data
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        super.safeTransferFrom(from, to, tokenId, data);
        emit PropertyTransferred(tokenId, from, to);
    }

    // The following functions are overrides required by Solidity
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}