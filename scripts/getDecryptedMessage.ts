import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { Blocklock, SolidityEncoder, encodeCiphertextToSolidity, encodeCondition } from "blocklock-js";

async function main() {
    // ✅ Set up wallet
    const privateKey = '';
    const provider = ethers.provider;
    const wallet = new Wallet(privateKey, provider);

    // const contractAddress = '0xBD9584B98cD20C3d4a8CA04Bba25cA05a5D9943c';
    // const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
    // const contract = ContractFactory.connect(wallet).attach(contractAddress);

    // const decryptedMessage = await contract.plainTextValue();
    // console.log(decryptedMessage);

    const blocklockjs = Blocklock.createFilecoinCalibnet(wallet);
    const result = await blocklockjs.fetchBlocklockStatus(BigInt(46));
    console.log(result);

    
}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});
