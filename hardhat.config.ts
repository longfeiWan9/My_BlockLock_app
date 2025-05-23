import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const YOUR_PRIVATE_KEY='';

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    calibration: {
      url: "https://api.calibration.node.glif.io/rpc/v1",
      chainId: 314159,
      accounts: [YOUR_PRIVATE_KEY]
    }
  }
};

export default config;
