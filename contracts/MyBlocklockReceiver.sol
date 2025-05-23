// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TypesLib} from "blocklock-solidity/src/libraries/TypesLib.sol";
import {AbstractBlocklockReceiver} from "blocklock-solidity/src/AbstractBlocklockReceiver.sol";

contract MyBlocklockReceiver is AbstractBlocklockReceiver {
    uint256 public requestId;
    TypesLib.Ciphertext public encryptedValue;
    uint256 public plainTextValue;

    constructor(address blocklockContract) AbstractBlocklockReceiver(blocklockContract) {}
    event BlocklockReqeustCreated(uint256 requestID, uint32 callbackGasLimit, uint256 requestPrice);

    function createTimelockRequestWithDirectFunding(
        uint32 callbackGasLimit,
        bytes calldata condition,
        TypesLib.Ciphertext calldata encryptedData
    ) external returns (uint256, uint256) {
        // create timelock request
        (uint256 requestID, uint256 requestPrice) =
            _requestBlocklockPayInNative(callbackGasLimit, condition, encryptedData);
        // store request id
        requestId = requestID;
        // store Ciphertext
        encryptedValue = encryptedData;
        emit BlocklockReqeustCreated(requestID, callbackGasLimit, requestPrice);
        return (requestID, requestPrice);
    }

    function _onBlocklockReceived(uint256 _requestId, bytes calldata decryptionKey) internal override {
        require(requestId == _requestId, "Invalid request id.");
        // decrypt stored Ciphertext with decryption key
        plainTextValue = abi.decode(_decrypt(encryptedValue, decryptionKey), (uint256));
    }
}