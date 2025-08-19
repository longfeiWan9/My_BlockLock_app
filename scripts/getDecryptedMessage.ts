import { ethers } from "hardhat";
import { MyBlocklockReceiver } from "../typechain-types";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();

    // Get the current network chain ID
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    
    // Read the deployed address from ignition deployment based on chain ID
    const deployedAddressesPath = path.join(__dirname, `../ignition/deployments/chain-${chainId}/deployed_addresses.json`);
    
    if (!fs.existsSync(deployedAddressesPath)) {
        throw new Error(`Deployment file not found for chain ID ${chainId}. Please deploy the contract to this network first.`);
    }
    
    const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
    const contractAddress = deployedAddresses["BlockLockModule#MyBlocklockReceiver"];
    
    if (!contractAddress) {
        throw new Error("Contract address not found in ignition deployment. Please deploy the contract first.");
    }
    
    console.log("Using contract address from ignition deployment:", contractAddress);
    console.log("Network chain ID:", chainId);
    
    const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
    const contract = ContractFactory.connect(signer).attach(contractAddress) as MyBlocklockReceiver;

    const plainTextValue = await contract.decryptedValue();
    console.log("Unlocked value:", plainTextValue);

}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});
