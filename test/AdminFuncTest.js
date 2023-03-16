// --------------------------------------------------
// 管理者が実行する関数を検証します
// --------------------------------------------------

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");
const { default: MerkleTree } = require("merkletreejs");
const { deploy } = require("./Test");

beforeEach(deploy);

describe("ownerMint", async () => {
  it("指定したアドレスにMintできる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setBaseURI", async () => {
  it("baseURIが設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setNotRevealedURI", async () => {
  it("notRevealedURIが設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setBaseExtension", async () => {
  it("baseExtensionが設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setRevealed", async () => {
  it("revealedが設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setPhasePaused", async () => {
  it("phaseをPausedに変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setPhasePresale1", async () => {
  it("phaseをPresale1に変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setPhasePresale2", async () => {
  it("phaseをPresale2に変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setPhasePublicSale", async () => {
  it("phaseをPublicSaleに変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setPhasePublicSale", async () => {
  it("phaseをPublicSaleに変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setMintPrice", async () => {
  it("mint価格を変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setMerkleRoot", async () => {
  it("MerkleRootを変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setWithdrawAddress", async () => {
  it("引き出しのアドレスを変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setDafaultRoyalty", async () => {
  it("ロイヤリティを変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setDafaultRoyalty", async () => {
  it("ロイヤリティを変更できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("withdraw", async () => {
  it("withdrawアドレスに期待した値が送金される", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

// ----------------------------------------------------------
// RestrictApprove
// ----------------------------------------------------------

describe("addLocalContractAllowList", async () => {
  it("ローカルの許可アドレスを追加できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("removeLocalContractAllowList", async () => {
  it("ローカルの許可アドレスを削除できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("getLocalContractAllowList", async () => {
  it("ローカルの許可アドレスが期待した値と一致する", async () => {});
});

describe("setCALLevel", async () => {
  it("CALレベルを設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setCAL", async () => {
  it("CALのアドレスを設定できる", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});

describe("setEnebleRestrict", async () => {
  it("", async () => {});
  it("OPERATOR以外はエラーが返される", async () => {});
});
