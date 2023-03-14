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
        runs: 500,
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
  },
  etherscan: {
    // Etherscan
    apiKey: process.env.SCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    token: "ETH",
    currency: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.COIN_MAEKETCAP_API_KEY,
    gasPrice: 25,
  },
};
