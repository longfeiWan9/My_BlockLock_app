import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

const YOUR_PRIVATE_KEY='';

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    'filecoin-calibration': {
      url: 'https://api.calibration.node.glif.io/rpc/v1',
      accounts: [YOUR_PRIVATE_KEY],
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [YOUR_PRIVATE_KEY],
      chainId: 84532,
    }
  },
  etherscan: {
    apiKey: {
      'filecoin-calibration': 'abc123', // dummy key for blockscout
      'base-sepolia': 'abc123' // replace with your Basescan API key
    },
    customChains: [
      {
        network: "filecoin-calibration",
        chainId: 314159,
        urls: {
          apiURL: "https://filecoin-testnet.blockscout.com/api",
          browserURL: "https://filecoin-testnet.blockscout.com/"
        }
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};

export default config;
