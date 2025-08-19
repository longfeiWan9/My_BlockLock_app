// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DEFAULT_SENDER = "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e";

const BlockLockModule = buildModule("BlockLockModule", (m) => {
    // Get the sender parameter with a default value
    const blocklockSenderAddress = m.getParameter("sender", DEFAULT_SENDER);
    const blockReceiver = m.contract("MyBlocklockReceiver", [blocklockSenderAddress]);

    return { blockReceiver };
});

export default BlockLockModule;
