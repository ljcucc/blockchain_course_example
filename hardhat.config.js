require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "canal vote increase expose hold draft damp miss enjoy correct decade machine",
      },
      chainId: 1337,
    },
  },
};
