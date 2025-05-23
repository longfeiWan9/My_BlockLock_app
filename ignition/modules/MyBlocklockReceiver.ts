// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlockLockModule = buildModule("BlockLockModule", (m) => {
    const blocklockSenderProxyAddress = m.getParameter("sender", "0xF00aB3B64c81b6Ce51f8220EB2bFaa2D469cf702");
    const blockReceiver = m.contract("MyBlocklockReceiver", [blocklockSenderProxyAddress]);

    return { blockReceiver };
});

export default BlockLockModule;
