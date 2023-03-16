// --------------------------------------------------
// 初期状態やconstructorに関する項目を検証します
// --------------------------------------------------

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deploy, calAddress, phasePaused } = require("./Test");

beforeEach(deploy);

describe("constructor", function () {
  it("供給量が50である", async () => {
    const res = await myContract.MAX_SUPPLY();
    expect(res).to.equal(50);
  });

  it("1Txあたりのミント数が2である", async () => {
    const res = await myContract.MAX_MINT_AMOUNT_PER_TX();
    expect(res).to.equal(2);
  });

  it("revealedがfalseとなっている", async () => {
    const res = await myContract.revealed();
    expect(res).to.equal(false);
  });

  it("phaseがPausedになっている", async () => {
    const res = await myContract.phase();
    expect(res).to.equal(phasePaused);
  });

  it("チームのアドレスに`DEFAULT_ADMIN_ROLE`が設定されている", async () => {
    const res = await myContract.hasRole(
      myContract.DEFAULT_ADMIN_ROLE(),
      myContract.TEAM_ADDRESS()
    );
    expect(res).to.equal(true);
  });

  it("チームのアドレスに`OPERATOR_ROLE`が設定されている", async () => {
    const res = await myContract.hasRole(
      myContract.OPERATOR_ROLE(),
      myContract.TEAM_ADDRESS()
    );
    expect(res).to.equal(true);
  });

  it("Deployしたアドレス(owner)に`OPERATOR_ROLE`が設定されている", async () => {
    const res = await myContract.hasRole(
      myContract.OPERATOR_ROLE(),
      owner.address
    );
    expect(res).to.equal(true);
  });

  it("ロイヤリティが正しく設定されている", async () => {
    const sellPrice = ethers.utils.parseEther("0.05");
    const [receiver, royaltyAmount] = await myContract.royaltyInfo(
      0,
      sellPrice
    );

    // 受け取りがwithdrawAddressと一致する
    expect(receiver).to.equal(await myContract.withdrawAddress());
    // 販売額の10%が設定されている
    expect(royaltyAmount).to.equal(sellPrice * 0.1);
  });

  it("CALのレベルが`1`として設定されている", async () => {
    const res = await myContract.CALLevel();
    expect(res).to.equal(1);
  });

  it("CALのアドレスが正しく設定されている", async () => {
    const res = await myContract.CAL();
    expect(res).to.equal(calAddress);
  });
});
