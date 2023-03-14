const { expect } = require("chai");
const { ethers } = require("hardhat"); // 明示的に書いておく
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Testコントラクト", function () {
  // Deploy時のFixtureを設定します
  // 各テストの最初に`loadFixture(deployTokenFixture)`で初期化します
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Test");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, owner, addr1, addr2 };
  }

  it("コンストラクタが正しく設定されている", async () => {
    const { hardhatToken } = await loadFixture(deployTokenFixture);
    expect(await hardhatToken.MAX_SUPPLY()).to.equal(50);
  });
});
