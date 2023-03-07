require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    currency: "CHF",
    gasPrice: 21,
  },
  networks: {
    // Ethereum
    // eth: {
    //   url: process.env.API_URL_ETH_MAIN,
    //   accounts: [process.env.SECRET_KEY_MIA],
    // },
    // Goerliテストネット
    goerli: {
      url: process.env.API_URL_GOERLI,
      accounts: [process.env.PRIVATE_KEY_TEST_ACCOUNT],
    },
    // polygon
    // polygon: {
    //   url: process.env.API_URL_POLYGON_MAIN,
    //   accounts: [process.env.SECRET_KEY_TESTNET_1],
    // },
    // Mumbaiテストネット
    // mumbai: {
    //   url: process.env.API_URL_MUMBAI,
    //   accounts: [process.env.SECRET_KEY_TESTNET_1],
    // },
  },
  etherscan: {
    // Etherscan
    apiKey: process.env.SCAN_API_KEY,
    // Polygonscan
    // apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};
