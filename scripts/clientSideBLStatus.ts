import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Blocklock, BlocklockStatus, decodeParams } from "blocklock-js";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();

    const requestId = 156n;
    
    // Create Blocklock instance for Base Sepolia
    const blocklockjs = Blocklock.createFilecoinCalibnet(signer as unknown as Signer);
    
    // Get the blocklock sender contract address for Base Sepolia
    const contractAddress = "0xF00aB3B64c81b6Ce51f8220EB2bFaa2D469cf702";
    const blocklockSender = await ethers.getContractAt("IBlocklockSender", contractAddress, signer as unknown as Signer);
    const isPending = await blocklockSender.isInFlight(requestId);
    if(!isPending){
      console.log(`Blocklock Request ${requestId} is not pending`);
      const result: BlocklockStatus = await blocklockjs.fetchBlocklockStatus(requestId);
      console.log(result);

      const decryptedBytes = await blocklockjs.decrypt(result.ciphertext, result.decryptionKey);
      // Convert Uint8Array to hex string
      const hexString = ethers.hexlify(decryptedBytes);
      // Example: Decode uint256
      const decodedValue = decodeParams(["uint256"], hexString);
      console.log("Decrypted value:", decodedValue);
    }
    else {
      console.log(`Blocklock Request ${requestId} is pending`);
    }

}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});
