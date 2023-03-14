const { expect } = require("chai");
const { ethers } = require("hardhat"); // 明示的に書いておく
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// const calAddress = "0xdbaa28cBe70aF04EbFB166b1A3E8F8034e5B9FC7"; // Mainnet
const calAddress = "0xb506d7BbE23576b8AAf22477cd9A7FDF08002211"; // Goerli

beforeEach(async function () {
  contract = await ethers.getContractFactory("Test");
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  ad = await contract.deploy();
});

describe("constructor", function () {
  it("チームのアドレスに`DEFAULT_ADMIN_ROLE`が設定されている", async () => {
    const res = await ad.hasRole(ad.DEFAULT_ADMIN_ROLE(), ad.teamAddress());
    expect(res).to.equal(true);
  });

  it("チームのアドレスに`OPERATOR_ROLE`が設定されている", async () => {
    const res = await ad.hasRole(ad.OPERATOR_ROLE(), ad.teamAddress());
    expect(res).to.equal(true);
  });

  it("Deployしたアドレスに`OPERATOR_ROLE`が設定されている", async () => {
    const res = await ad.hasRole(ad.OPERATOR_ROLE(), ad.teamAddress());
    expect(res).to.equal(true);
  });

  it("ロイヤリティが正しく設定されている", async () => {
    const sellPrice = ethers.utils.parseEther("0.05");

    const res = await ad.royaltyInfo(0, sellPrice);

    // 受け取りがチームアドレスである
    expect(res[0]).to.equal(await ad.teamAddress());
    // 販売額の10%が設定されている
    expect(res[1]).to.equal(sellPrice * 0.1);
  });

  it("CALのレベルが`1`として設定されている", async () => {
    const res = await ad.CALLevel();
    expect(res).to.equal(1);
  });

  it("CALのアドレスが正しく設定されている", async () => {
    const res = await ad.CAL();
    expect(res).to.equal(calAddress);
  });
});
