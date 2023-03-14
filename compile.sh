#!/bin/sh

npx hardhat compile && yarn hardhat size-contracts
echo ">>> コントラクトサイズのMAXは 24.576KBです"