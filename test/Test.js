const { expect } = require("chai");
const { ethers } = require("hardhat"); // 明示的に書いておく
const { keccak256 } = require("ethers/lib/utils");
const { default: MerkleTree } = require("merkletreejs");
const {
  useFixture,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

// const calAddress = "0xdbaa28cBe70aF04EbFB166b1A3E8F8034e5B9FC7"; // Mainnet
const calAddress = "0xb506d7BbE23576b8AAf22477cd9A7FDF08002211"; // Goerli

const phasePaused = 0;
const phasePresale1 = 1;
const phasePresale2 = 2;
const phasePublicSale = 3;

describe("Test", function () {
  beforeEach(async () => {
    contract = await ethers.getContractFactory("Test");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    contract = await ethers.getContractFactory("Test");

    myContract = await contract.deploy();
  });

  // arg: {address: maxMintAmount}の"配列"を引数に指定
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

  describe("presaleMint", async () => {
    // プレセールの準備をします
    const setup = async (address, maxMintAmount) => {
      // ALを登録
      const tree = createMerkleTree([
        { address: address, maxMintAmount: maxMintAmount },
      ]);

      await myContract
        .connect(owner)
        .setMerkleRoot(phasePresale1, tree.getHexRoot());

      // phaseをPresale1に設定
      await myContract.connect(owner).setPhasePresala1();

      return tree;
    };

    it("最大数でmintできる", async () => {
      // `addr1`が`最大2mint`できるようにAL登録
      const tree = await setup(addr1.address, 2);

      // mint
      await myContract
        .connect(addr1)
        .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
          value: ethers.utils.parseEther("0.002"),
        });

      // totalSupplyが期待した値と一致ことを確認
      const totalSupply = await myContract.totalSupply();
      expect(totalSupply).to.equal(2);

      // addr1が正常にmintできていることを確認
      const addr1Minted = await myContract.balanceOf(addr1.address);
      expect(addr1Minted).to.equal(2);
    });

    it("上限以内であれば複数回mintできる", async () => {
      const tree = await setup(addr1.address, 2);

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
      const tree = await setup(addr1.address, 2);

      // phaseをPausedに変更
      await myContract.connect(owner).setPhasePaused();

      // mint
      await expect(
        myContract
          .connect(addr1)
          .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
            value: ethers.utils.parseEther("0.002"),
          })
      ).to.be.reverted;
    });

    it("phaseがPublicSaleの場合はエラーが返される", async () => {
      const tree = await setup(addr1.address, 2);

      // phaseをPublicSaleに変更
      await myContract.connect(owner).setPhasePublicSale();

      // mint
      await expect(
        myContract
          .connect(addr1)
          .presaleMint(2, tree.getHexProof(keccak256(addr1.address)), 2, {
            value: ethers.utils.parseEther("0.002"),
          })
      ).to.be.reverted;
    });

    it("ETHが不足している場合はエラーが返される", async () => {});
    it("最大供給数を超える場合はエラーが返される", async () => {});
    it("1アドレスの最大数を超える場合はエラーが返される", async () => {});
    it("ALに入っていないアドレスはエラーが返される", async () => {});
  });

  describe("publicMint", async () => {
    it("1Txあたりの最大数でmintできる", async () => {});
    it("複数回mintできる", async () => {});
    it("phaseがPrivateの場合はエラーが返される", async () => {});
    it("phaseがPresale1の場合はエラーが返される", async () => {});
    it("phaseがPresale2の場合はエラーが返される", async () => {});
    it("ETHが不足している場合はエラーが返される", async () => {});
    it("最大供給数を超える場合はエラーが返される", async () => {});
    it("1Txの最大数を超える場合はエラーが返される", async () => {});
  });

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
});
