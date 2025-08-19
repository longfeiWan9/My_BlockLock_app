import { ethers } from "hardhat";
import { getBytes, Signer } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";
import { MyBlocklockReceiver } from "../typechain-types";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();

    // 1. Connect to the myBlocklockReceiver contract
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

    // Set block height for blocklock (current block + 10)
    const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 6);
    const conditionBytes = encodeCondition(blockHeight);

    // message bytes
    const msg = ethers.parseEther("5.15"); // Example: BigInt for blocklock ETH transfer
    const msgBytes = encodeParams(["uint256"], [msg]);
    const encodedMessage = getBytes(msgBytes);

    // Encrypt the encoded message
    const blocklockjs = Blocklock.createFilecoinCalibnet(signer as unknown as Signer);
    const ciphertext = blocklockjs.encrypt(encodedMessage, blockHeight);

    // Set the callback gas limit and request call back price
    // Better practice is to estimate the gas limit and request price
    const callbackGasLimit = 450_000_000n;
    // const requestCallBackPrice = ethers.parseEther("2"); 
    const [requestCallBackPrice, txGasPrice] = await blocklockjs.calculateRequestPriceNative(callbackGasLimit);

    console.log("Target block for unlock:", blockHeight);
    console.log("Callback gas limit:", callbackGasLimit);
    console.log("Request CallBack price:", ethers.formatEther(requestCallBackPrice), "ETH");
    console.log("Tx gas Price:", ethers.formatEther(txGasPrice), "ETH");

    const balance = await ethers.provider.getBalance(signer.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    if (balance < requestCallBackPrice) {
        throw new Error(`Insufficient balance. Need ${ethers.formatEther(requestCallBackPrice)} ETH but have ${ethers.formatEther(balance)} ETH`);
    }
    
    const tx = await contract.createBlocklockRequestWithDirectFunding(
        callbackGasLimit,
        conditionBytes,
        encodeCiphertextToSolidity(ciphertext)
    ,{ value: requestCallBackPrice });
    
    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait(1);
    if (!receipt) {
        throw new Error("Transaction failed");
    }
    console.log("BlockLock requested in tx:", receipt.hash);
}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});