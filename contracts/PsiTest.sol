// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "erc721psi/contracts/ERC721Psi.sol";
import "contract-allow-list/contracts/ERC721AntiScam/restrictApprove/ERC721RestrictApprove.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Test is ERC721RestrictApprove, AccessControl, Ownable, ERC2981 {
    enum SalePhase {
        Paused,
        Presale1,
        Presale2,
        PublicSale
    }

    uint256 public constant MAX_SUPPLY = 50;
    uint256 public constant MAX_PUBLIC_MINT_AMOUNT_PER_TX = 2;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    string public baseURI;
    string public notRevealedURI;
    string public baseExtension = ".json";
    bool public revealed;

    SalePhase public phase = SalePhase.Paused;
    mapping(SalePhase => uint256) public mintPrice;
    mapping(SalePhase => bytes32) public merkleRoot;
    mapping(address => uint256) public presaleMinted;

    constructor() ERC721Psi("Test", "TEST") {
        _grantRole(ADMIN_ROLE, 0xEA1a2Dfbc2cF2793ef0772dc0625Cd09750747f5);
        _grantRole(OPERATOR_ROLE, 0xEA1a2Dfbc2cF2793ef0772dc0625Cd09750747f5);
        _grantRole(OPERATOR_ROLE, 0xEA1a2Dfbc2cF2793ef0772dc0625Cd09750747f5);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
    }

    // ----------------------------------------------------------
    // Modifier
    // ----------------------------------------------------------

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract.");
        _;
    }

    modifier onlyPhasePresale() {
        require(
            phase == SalePhase.Presale1 || phase == SalePhase.Presale2,
            "Not is presale phase"
        );
        _;
    }

    modifier onlyPhasePublicSale() {
        require(phase == SalePhase.PublicSale, "Not is public phase");
        _;
    }

    modifier enoughEth(uint256 _mintAmount) {
        require(
            msg.value >= mintPrice[phase] * _mintAmount,
            "Insufficient eth"
        );
        _;
    }

    modifier notExceededMaxSupply(uint256 quantity) {
        require(
            quantity + totalSupply() <= MAX_SUPPLY,
            "claim is over the max supply"
        );
        _;
    }

    modifier notExceededMaxMintAmountPerAddress(
        uint256 _maxMintAmount,
        uint256 _mintAmount
    ) {
        require(
            _maxMintAmount <= presaleMinted[_msgSender()] + _mintAmount,
            "exceeded max mint amount"
        );
        _;
    }

    modifier notExceededMaxMintAmountPerTx(uint256 _mintAmount) {
        require(
            _mintAmount <= MAX_PUBLIC_MINT_AMOUNT_PER_TX,
            "exceeded max mint amount per Tx"
        );
        _;
    }

    modifier onlyAllowlisted(
        bytes32[] calldata _merkleProof,
        uint256 _maxMintAmount
    ) {
        require(
            isAllowListed(phase, _msgSender(), _merkleProof, _maxMintAmount),
            "Not AllowListed"
        );
        _;
    }

    // ----------------------------------------------------------
    // User functions
    // ----------------------------------------------------------

    function presaleMint(
        uint256 _mintAmount,
        bytes32[] calldata _merkleProof,
        uint256 _maxMintAmount
    )
        external
        payable
        callerIsUser
        onlyPhasePresale
        enoughEth(_mintAmount)
        notExceededMaxSupply(_mintAmount)
        notExceededMaxMintAmountPerAddress(_maxMintAmount, _mintAmount)
        onlyAllowlisted(_merkleProof, _maxMintAmount)
    {
        require(tx.origin == msg.sender, "The caller is another contract.");
        presaleMinted[_msgSender()] += _mintAmount;
        _safeMint(_msgSender(), _mintAmount);
    }

    function publicMint(uint256 _mintAmount)
        external
        payable
        callerIsUser
        onlyPhasePublicSale
        enoughEth(_mintAmount)
        notExceededMaxSupply(_mintAmount)
        notExceededMaxMintAmountPerTx(_mintAmount)
    {
        _safeMint(_msgSender(), _mintAmount);
    }

    /**
     * @dev Make the Allow list a public function rather than a modifier
     * so that it can be checked before mint.
     */
    function isAllowListed(
        SalePhase _phase,
        address _minter,
        bytes32[] calldata _merkleProof,
        uint256 _maxMintAmount
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_minter, _maxMintAmount));

        return
            MerkleProof.verifyCalldata(_merkleProof, merkleRoot[_phase], leaf);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // ----------------------------------------------------------
    // Admin functions
    // ----------------------------------------------------------

    function setBaseURI(string memory _newURI) public onlyRole(OPERATOR_ROLE) {
        baseURI = _newURI;
    }

    function setNotRevealedURI(string memory _newURI)
        public
        onlyRole(OPERATOR_ROLE)
    {
        baseURI = _newURI;
    }

    function setBaseExtension(string memory _newExtension)
        public
        onlyRole(OPERATOR_ROLE)
    {
        baseExtension = _newExtension;
    }

    function setRevealed(bool _status) external onlyRole(OPERATOR_ROLE) {
        revealed = _status;
    }

    function pause() external onlyRole(OPERATOR_ROLE) {
        phase = SalePhase.Paused;
    }

    function setPhasePresala1() external onlyRole(OPERATOR_ROLE) {
        phase = SalePhase.Presale1;
    }

    function setPhasePresale2() external onlyRole(OPERATOR_ROLE) {
        phase = SalePhase.Presale2;
    }

    function setPhasePublicSale() external onlyRole(OPERATOR_ROLE) {
        phase = SalePhase.PublicSale;
    }

    function setMintPrice(SalePhase _phase, uint256 _price)
        external
        onlyRole(OPERATOR_ROLE)
    {
        mintPrice[_phase] = _price;
    }

    function setMerkleRoot(SalePhase _phase, bytes32 _merkleRoot)
        external
        onlyRole(OPERATOR_ROLE)
    {
        merkleRoot[_phase] = _merkleRoot;
    }

    // ----------------------------------------------------------
    // RestrictApprove
    // ----------------------------------------------------------

    function addLocalContractAllowList(address transferer)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        _addLocalContractAllowList(transferer);
    }

    function removeLocalContractAllowList(address transferer)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        _removeLocalContractAllowList(transferer);
    }

    function getLocalContractAllowList()
        external
        view
        override
        returns (address[] memory)
    {
        return _getLocalContractAllowList();
    }

    function setCALLevel(uint256 level) public override onlyRole(ADMIN_ROLE) {
        CALLevel = level;
    }

    function setCAL(address calAddress) external override onlyRole(ADMIN_ROLE) {
        _setCAL(calAddress);
    }

    // ----------------------------------------------------------
    // Interface
    // ----------------------------------------------------------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721RestrictApprove, AccessControl, ERC2981)
        returns (bool)
    {
        return
            AccessControl.supportsInterface(interfaceId) ||
            ERC721RestrictApprove.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }
}
