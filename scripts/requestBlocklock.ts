import { ethers } from "hardhat";
import { Wallet, getBytes } from "ethers";
import { Blocklock, SolidityEncoder, encodeCiphertextToSolidity, encodeCondition } from "blocklock-js";

async function main() {
    // 1. Set up wallet
    const privateKey = '';
    const provider = ethers.provider;
    const wallet = new Wallet(privateKey, provider);

    // 2. Connect to the myBlocklockReceiver contract
    const contractAddress = '0x1B07670ff6820A82cE9DFAF1267a5F3ef6944FDd';
    const ContractFactory = await ethers.getContractFactory("MyBlocklockReceiver");
    const contract = ContractFactory.connect(wallet).attach(contractAddress);

    // 3. Prepare the params for invoking myBlocklockReceiver contract.
    // Set block height for blocklock (current block + 10)
    const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 10);
    const conditionBytes = encodeCondition(blockHeight);

    // Encrypt an messsage
    const msg = ethers.parseEther("12");;
    const encoder = new SolidityEncoder();
    const msgBytes = encoder.encodeUint256(msg);
    const encodedMessage = getBytes(msgBytes);

    // Encrypt the encoded message
    const blocklockjs = Blocklock.createFilecoinCalibnet(wallet);
    const ciphertext = blocklockjs.encrypt(encodedMessage, blockHeight);

    const callbackGasLimit = 1000_000;

    console.log("Sending blocklock request to lock message until block:", blockHeight);

    const tx = await contract.createTimelockRequestWithDirectFunding(
        callbackGasLimit,
        conditionBytes,
        encodeCiphertextToSolidity(ciphertext)
      );
    const receipt = await tx.wait();
    console.log("BlockLock requested in tx: ", receipt.hash);

    // const requestID = await blocklockjs.requestBlocklock(blockHeight, encodeCiphertextToSolidity(ciphertext));
    // console.log("requst ID is ", requestID);
}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});