import { ethers } from "hardhat";
import { Signer } from "ethers";
import { Blocklock, BlocklockStatus, decodeParams } from "blocklock-js";
import { MyBlocklockReceiver } from "../typechain-types";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();

    const requestId = 149n;
    
    // Get the deployed contract address
    const contractAddress = '0x4f38B53E54ADFC3A3Aa820Ccd2e43a4a0605CF92';
    const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
    const contract = ContractFactory.connect(signer).attach(contractAddress) as MyBlocklockReceiver;
    
    // Get the blocklock sender address from the deployed contract
    // const blocklockSenderAddress = await contract.blocklock();
    // const blocklockSender = await ethers.getContractAt("IBlocklockSender", blocklockSenderAddress, signer as unknown as Signer);
    const isPending = await contract.isInFlight(requestId);
    if(!isPending){
      console.log(`Request ${requestId} is not pending`);
      const blocklockjs = Blocklock.createFilecoinCalibnet(signer as unknown as Signer);
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
      console.log("Blocklock Request is pending");
    }

}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});
