// --------------------------------------------------
// テストで汎用的に使用する関数や状態を定義します
// --------------------------------------------------

const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");
const { default: MerkleTree } = require("merkletreejs");

// const calAddress = "0xdbaa28cBe70aF04EbFB166b1A3E8F8034e5B9FC7"; // Mainnet
const calAddress = "0xb506d7BbE23576b8AAf22477cd9A7FDF08002211"; // Goerli

const phasePaused = 0;
const phasePresale1 = 1;
const phasePresale2 = 2;
const phasePublicSale = 3;

// コントラクトをデプロイします
//
// 各テストファイルの`beforeEach`で読み込みます。
const deploy = async () => {
  contract = await ethers.getContractFactory("Test");
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  contract = await ethers.getContractFactory("Test");

  myContract = await contract.deploy();
};

// MerkleTreeを算出します
//
// {address: maxMintAmount}の"配列"を引数に指定します。
const createMerkleTree = (addressesWithAmount) => {
  // アドレスを全て小文字に変換
  const lowerAddrMap = addressesWithAmount.map((map) => {
    return {
      address: map.address.toLowerCase(),
      maxMintAmount: map.maxMintAmount,
    };
  });

  // leafを作成
  const leaves = lowerAddrMap.map((map) => {
    const leaf = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [map.address, map.maxMintAmount]
    );

    return leaf;
  });

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  return tree;
};

module.exports = {
  deploy,
  createMerkleTree,
  calAddress,
  phasePaused,
  phasePresale1,
  phasePresale2,
  phasePublicSale,
};
