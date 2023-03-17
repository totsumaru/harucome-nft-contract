// --------------------------------------------------
// 管理者が実行する関数を検証します
//
// - 全ての関数で`OPERATOR`の検証を行います
// --------------------------------------------------

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");
const { default: MerkleTree } = require("merkletreejs");
const {
  deploy,
  phasePaused,
  phasePresale1,
  phasePresale2,
  phasePublicSale,
} = require("./Test");

beforeEach(deploy);

describe("ownerMint", async () => {
  it("指定したアドレスにMintできる", async () => {
    await myContract.connect(owner).ownerMint(addr1.address, 2);

    // addr1にmintできていることを確認
    const addr1Minted = await myContract.balanceOf(addr1.address);
    expect(addr1Minted).to.equal(2);
  });
  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).ownerMint(3)).to.be.reverted;
  });
});

describe("setBaseURI", async () => {
  it("baseURIが設定できる", async () => {
    await myContract.connect(owner).setBaseURI("foo");

    const res = await myContract.baseURI();
    expect(res).to.equal("foo");
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setBaseURI("foo")).to.be.reverted;
  });
});

describe("setNotRevealedURI", async () => {
  it("notRevealedURIが設定できる", async () => {
    await myContract.connect(owner).setNotRevealedURI("foo");

    const res = await myContract.notRevealedURI();
    expect(res).to.equal("foo");
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setNotRevealedURI("foo")).to.be
      .reverted;
  });
});

describe("setBaseExtension", async () => {
  it("baseExtensionが設定できる", async () => {
    await myContract.connect(owner).setBaseExtension("foo");

    const res = await myContract.baseExtension();
    expect(res).to.equal("foo");
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setBaseExtension("foo")).to.be
      .reverted;
  });
});

describe("setRevealed", async () => {
  it("revealedが設定できる", async () => {
    await myContract.connect(owner).setRevealed(true);

    const res = await myContract.revealed();
    expect(res).to.equal(true);
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setRevealed(true)).to.be.reverted;
  });
});

describe("setPhasePaused", async () => {
  it("phaseをPausedに変更できる", async () => {
    await myContract.connect(owner).setPhasePaused();

    const res = await myContract.phase();
    expect(res).to.equal(phasePaused);
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setPhasePaused()).to.be.reverted;
  });
});

describe("setPhasePresale1", async () => {
  it("phaseをPresale1に変更できる", async () => {
    await myContract.connect(owner).setPhasePresale1();

    const res = await myContract.phase();
    expect(res).to.equal(phasePresale1);
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setPhasePresale1()).to.be.reverted;
  });
});

describe("setPhasePresale2", async () => {
  it("phaseをPresale2に変更できる", async () => {
    await myContract.connect(owner).setPhasePresale2();

    const res = await myContract.phase();
    expect(res).to.equal(phasePresale2);
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setPhasePresale2()).to.be.reverted;
  });
});

describe("setPhasePublicSale", async () => {
  it("phaseをPublicSaleに変更できる", async () => {
    await myContract.connect(owner).setPhasePublicSale();

    const res = await myContract.phase();
    expect(res).to.equal(phasePublicSale);
  });

  it("OPERATOR以外はエラーが返される", async () => {
    // addr1で実行
    await expect(myContract.connect(addr1).setPhasePublicSale()).to.be.reverted;
  });
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
