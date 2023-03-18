// --------------------------------------------------
// mintに関するテストを実行します
//
// - `presaleMint`と`publicMint`の2つの関数のみを検証します
// - `Test.js`で定義したテスト用の関数を使用しています
// --------------------------------------------------

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");
const {
  deploy,
  createMerkleTree,
  phasePresale1,
  phasePresale2,
} = require("./Test");

beforeEach(deploy);

describe("presaleMint", async () => {
  // presaleのセットアップをします
  const presaleSetup = async ({
    address,
    maxMintAmount,
    phase = phasePresale1,
  }) => {
    // ALを登録
    const tree = createMerkleTree([
      { address: address, maxMintAmount: maxMintAmount },
    ]);
    await myContract.connect(owner).setMerkleRoot(phase, tree.getHexRoot());

    // phaseをPresale1に設定
    await myContract.connect(owner).setPhasePresale1();

    return tree;
  };

  it("最大数でmintできる", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // mint
    await myContract
      .connect(addr1)
      .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
        value: ethers.utils.parseEther("0.002"),
      });

    // addr1が正常にmintできていることを確認
    const addr1Minted = await myContract.balanceOf(addr1.address);
    expect(addr1Minted).to.equal(2);
  });

  it("phaseがPresale2でmintできる", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
      phase: phasePresale2,
    });

    // phaseをPresale2に変更
    await myContract.connect(owner).setPhasePresale2();

    // mint
    await myContract
      .connect(addr1)
      .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
        value: ethers.utils.parseEther("0.002"),
      });

    // addr1が正常にmintできていることを確認
    const addr1Minted = await myContract.balanceOf(addr1.address);
    expect(addr1Minted).to.equal(2);
  });

  it("上限以内であれば複数回mintできる", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // 1枚ずつのmintを2回実行する
    for (let i = 0; i < 2; i++) {
      await myContract
        .connect(addr1)
        .presaleMint(1, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.001"),
        });
    }

    // addr1が正常にmintできていることを確認
    const add1Minted = await myContract.balanceOf(addr1.address);
    expect(add1Minted).to.equal(2);
  });

  it("phaseがPausedの場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // phaseをPausedに変更
    await myContract.connect(owner).setPhasePaused();

    // mint
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.002"),
        })
    ).to.revertedWith("Not is presale phase");
  });

  it("phaseがPublicSaleの場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // mint
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.002"),
        })
    ).to.revertedWith("Not is presale phase");
  });

  it("ETHが不足している場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // mint
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.001"), // 本来は0.002ETH必要
        })
    ).to.revertedWith("Insufficient eth");
  });

  it("最大供給数を超える場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 51,
    });

    // mint
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(51, tree.getHexProof(keccak256(addr1.address)), 51, {
          value: ethers.utils.parseEther("0.051"),
        })
    ).to.revertedWith("claim is over the max supply");
  });

  it("1アドレスの最大数を超える場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // mint
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(3, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.003"),
        })
    ).to.revertedWith("exceeded max mint amount per wallet");
  });

  it("ALに入っていないアドレスはエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // mint
    await expect(
      myContract
        .connect(addr2) // addr1のみALに登録しているが、addr2でmint
        .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.002"),
        })
    ).to.revertedWith("Not AllowListed");
  });

  it("最大mint数が誤っている場合はエラーが返される", async () => {
    const tree = await presaleSetup({
      address: addr1.address,
      maxMintAmount: 2,
    });

    // mint
    // 3mintにてチャレンジ
    await expect(
      myContract
        .connect(addr1)
        .presaleMint(3, tree.getHexProof(keccak256(addr1.address)), 3, {
          value: ethers.utils.parseEther("0.003"),
        })
    ).to.revertedWith("Not AllowListed");
  });
});

describe("publicMint", async () => {
  it("1Txあたりの最大数でmintできる", async () => {
    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // mint
    await myContract.connect(addr1).publicMint(2, {
      value: ethers.utils.parseEther("0.01"),
    });

    // addr1が正常にmintできていることを確認
    const addr1Minted = await myContract.balanceOf(addr1.address);
    expect(addr1Minted).to.equal(2);
  });

  it("複数回mintできる", async () => {
    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // 2枚ずつ2回mintを実行
    for (let i = 0; i < 2; i++) {
      await myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.01"),
      });
    }

    // addr1が正常にmintできていることを確認
    const addr1Minted = await myContract.balanceOf(addr1.address);
    expect(addr1Minted).to.equal(4);
  });

  it("phaseがPausedの場合はエラーが返される", async () => {
    // phaseをPausedに変更
    await myContract.connect(owner).setPhasePaused();

    // mint
    await expect(
      myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.revertedWith("Not is public phase");
  });

  it("phaseがPresale1の場合はエラーが返される", async () => {
    // phaseをPresale1に変更
    await myContract.connect(owner).setPhasePresale1();

    // mint
    await expect(
      myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.revertedWith("Not is public phase");
  });

  it("phaseがPresale2の場合はエラーが返される", async () => {
    // phaseをPresale2に変更
    await myContract.connect(owner).setPhasePresale2();

    // mint
    await expect(
      myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.revertedWith("Not is public phase");
  });

  it("ETHが不足している場合はエラーが返される", async () => {
    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // mint
    await expect(
      myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.0099"),
      })
    ).to.revertedWith("Insufficient eth");
  });

  it("最大供給数を超える場合はエラーが返される", async () => {
    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // ownerMintにて49枚をmint
    await myContract.connect(owner).ownerMint(addr1.address, 49);

    // mint
    await expect(
      myContract.connect(addr1).publicMint(2, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.revertedWith("claim is over the max supply");
  });

  it("1Txの最大数を超える場合はエラーが返される", async () => {
    // phaseをPublicSaleに変更
    await myContract.connect(owner).setPhasePublicSale();

    // mint
    await expect(
      myContract.connect(addr1).publicMint(3, {
        value: ethers.utils.parseEther("0.015"),
      })
    ).to.revertedWith("exceeded max mint amount per Tx");
  });
});
