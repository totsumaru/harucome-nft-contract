// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "erc721psi/contracts/ERC721Psi.sol";
import "contract-allow-list/contracts/ERC721AntiScam/restrictApprove/ERC721RestrictApprove.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "hardhat/console.sol"; // TODO: 削除

// TODO: DefaultOperatorFilterを入れる

contract Test is ERC721RestrictApprove, AccessControl, Ownable, ERC2981 {
    enum SalePhase {
        Paused,
        Presale1,
        Presale2,
        PublicSale
    }

    uint256 public constant MAX_SUPPLY = 50;
    uint256 public constant MAX_MINT_AMOUNT_PER_TX = 2;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
    address public constant TEAM_ADDRESS =
        0xEA1a2Dfbc2cF2793ef0772dc0625Cd09750747f5;

    string public baseURI;
    string public notRevealedURI;
    string public baseExtension = ".json";
    bool public revealed;

    SalePhase public phase = SalePhase.Paused;
    mapping(SalePhase => uint256) public mintPrice;
    mapping(SalePhase => bytes32) public merkleRoot;

    address public withdrawAddress = 0xEA1a2Dfbc2cF2793ef0772dc0625Cd09750747f5;

    mapping(address => uint256) public presaleMinted;

    constructor() ERC721Psi("Test", "TEST") {
        _grantRole(DEFAULT_ADMIN_ROLE, TEAM_ADDRESS);
        _grantRole(OPERATOR_ROLE, TEAM_ADDRESS);
        _grantRole(OPERATOR_ROLE, _msgSender());

        _setDefaultRoyalty(withdrawAddress, 1000);

        mintPrice[SalePhase.Presale1] = 0.001 ether;
        mintPrice[SalePhase.Presale2] = 0.001 ether;
        mintPrice[SalePhase.PublicSale] = 0.005 ether;

        setCALLevel(1);
        // setCAL(0xdbaa28cBe70aF04EbFB166b1A3E8F8034e5B9FC7); // Mainnet
        setCAL(0xb506d7BbE23576b8AAf22477cd9A7FDF08002211); // TODO: Delete this line.
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
            _maxMintAmount >= presaleMinted[_msgSender()] + _mintAmount,
            "exceeded max mint amount per wallet"
        );
        _;
    }

    /**
     * @dev use only public sale
     */
    modifier notExceededMaxMintAmountPerTx(uint256 _mintAmount) {
        require(
            _mintAmount <= MAX_MINT_AMOUNT_PER_TX,
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
        presaleMinted[_msgSender()] += _mintAmount;
        _safeMint(_msgSender(), _mintAmount);
    }

    function publicMint(
        uint256 _mintAmount
    )
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

    // ----------------------------------------------------------
    // Operator functions
    // ----------------------------------------------------------

    function ownerMint(
        address _to,
        uint256 _mintAmount
    ) external notExceededMaxSupply(_mintAmount) onlyRole(OPERATOR_ROLE) {
        _safeMint(_to, _mintAmount);
    }

    function setBaseURI(string memory _uri) external onlyRole(OPERATOR_ROLE) {
        baseURI = _uri;
    }

    function setNotRevealedURI(
        string memory _uri
    ) external onlyRole(OPERATOR_ROLE) {
        baseURI = _uri;
    }

    function setBaseExtension(
        string memory _extension
    ) external onlyRole(OPERATOR_ROLE) {
        baseExtension = _extension;
    }

    function setRevealed(bool _status) external onlyRole(OPERATOR_ROLE) {
        revealed = _status;
    }

    function setPhasePaused() external onlyRole(OPERATOR_ROLE) {
        phase = SalePhase.Paused;
    }

    function setPhasePresala1() external onlyRole(OPERATOR_ROLE) {
        require(mintPrice[SalePhase.Presale1] > 0, "price is zero");
        phase = SalePhase.Presale1;
    }

    function setPhasePresale2() external onlyRole(OPERATOR_ROLE) {
        require(mintPrice[SalePhase.Presale2] > 0, "price is zero");
        phase = SalePhase.Presale2;
    }

    function setPhasePublicSale() external onlyRole(OPERATOR_ROLE) {
        require(mintPrice[SalePhase.PublicSale] > 0, "price is zero");
        phase = SalePhase.PublicSale;
    }

    function setMintPrice(
        SalePhase _phase,
        uint256 _price
    ) external onlyRole(OPERATOR_ROLE) {
        mintPrice[_phase] = _price;
    }

    function setMerkleRoot(
        SalePhase _phase,
        bytes32 _merkleRoot
    ) external onlyRole(OPERATOR_ROLE) {
        merkleRoot[_phase] = _merkleRoot;
    }

    function setWithdrawAddress(
        address _withdrawAddress
    ) public onlyRole(OPERATOR_ROLE) {
        withdrawAddress = _withdrawAddress;
    }

    function setDefaultRoyalty(
        address _receiver,
        uint96 _feeNumerator
    ) public onlyRole(OPERATOR_ROLE) {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    function withdraw() public onlyRole(OPERATOR_ROLE) {
        (bool os, ) = payable(withdrawAddress).call{
            value: address(this).balance
        }("");
        require(os);
    }

    // ----------------------------------------------------------
    // internal functions
    // ----------------------------------------------------------

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // ----------------------------------------------------------
    // RestrictApprove
    // ----------------------------------------------------------

    function addLocalContractAllowList(
        address transferer
    ) external override onlyRole(OPERATOR_ROLE) {
        _addLocalContractAllowList(transferer);
    }

    function removeLocalContractAllowList(
        address transferer
    ) external override onlyRole(OPERATOR_ROLE) {
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

    function setCALLevel(
        uint256 level
    ) public override onlyRole(OPERATOR_ROLE) {
        CALLevel = level;
    }

    function setCAL(
        address calAddress
    ) public override onlyRole(OPERATOR_ROLE) {
        _setCAL(calAddress);
    }

    function setEnebleRestrict(bool _status) public onlyRole(OPERATOR_ROLE) {
        enableRestrict = _status;
    }

    // ----------------------------------------------------------
    // Interface
    // ----------------------------------------------------------

    function supportsInterface(
        bytes4 interfaceId
    )
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
