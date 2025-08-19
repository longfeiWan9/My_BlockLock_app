import { ethers } from "hardhat";
import { getBytes, Signer } from "ethers";
import { Blocklock, encodeParams } from "blocklock-js";

async function main() {
    // Get the signer from hardhat config
    const [signer] = await ethers.getSigners();
    const blocklockjs = Blocklock.createFilecoinCalibnet(signer as unknown as Signer);

    // Set block height for blocklock (current block + 10)
    const blockHeight = BigInt(await ethers.provider.getBlockNumber() + 5);

    // message bytes
    const msg = ethers.parseEther("13.15"); // Example: BigInt for blocklock ETH transfer
    const msgBytes = encodeParams(["uint256"], [msg]);
    const encodedMessage = getBytes(msgBytes);

    // Encrypt the encoded message
    const {id, ciphertext} = await blocklockjs.encryptAndRegister(encodedMessage, blockHeight);
    console.log("blocklock request id is ", id);
    console.log("ciphertext is ", ciphertext);
}

main().catch((err) => {
  console.error("Invocation failed:", err);
  process.exitCode = 1;
});