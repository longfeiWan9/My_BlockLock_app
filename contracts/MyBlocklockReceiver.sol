// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {TypesLib} from "blocklock-solidity/src/libraries/TypesLib.sol";
import {AbstractBlocklockReceiver} from "blocklock-solidity/src/AbstractBlocklockReceiver.sol";

contract MyBlocklockReceiver is AbstractBlocklockReceiver {
    uint256 public requestId;
    TypesLib.Ciphertext public encryptedValue;
    uint256 public decryptedValue;

    constructor(address blocklockContract) AbstractBlocklockReceiver(blocklockContract) {}

    event BlocklockReqeustCreated(uint256 requestID, uint32 callbackGasLimit, uint256 requestPrice);
    event CallbackReceivedWithoutDecryption(uint256 requestID, bytes decryptionKey);

    function createBlocklockRequestWithDirectFunding(
        uint32 callbackGasLimit,
        bytes calldata condition,
        TypesLib.Ciphertext calldata _encryptedValue
    ) external payable returns (uint256, uint256) {
        // create timelock request
        (uint256 requestID, uint256 requestPrice) =
            _requestBlocklockPayInNative(callbackGasLimit, condition, _encryptedValue);
        // store request id
        requestId = requestID;
        // store Ciphertext
        encryptedValue = _encryptedValue;
        emit BlocklockReqeustCreated(requestID, callbackGasLimit, requestPrice);
        return (requestID, requestPrice);
    }

    function createBlocklockRequestWithSubscription(
        uint32 callbackGasLimit,
        bytes calldata condition,
        TypesLib.Ciphertext calldata _encryptedValue
    ) external returns (uint256) {
        // create timelock request
        uint256 _requestId = _requestBlocklockWithSubscription(callbackGasLimit, condition, _encryptedValue);
        // store request id
        requestId = _requestId;
        // store Ciphertext
        encryptedValue = _encryptedValue;
        return requestId;
    }

    function cancelSubscription(address to) external onlyOwner {
        _cancelSubscription(to);
    }

    function _onBlocklockReceived(uint256 _requestId, bytes calldata decryptionKey) internal override {
        require(requestId == _requestId, "Invalid request id.");

        emit CallbackReceivedWithoutDecryption(_requestId, decryptionKey);
        // decrypt stored Ciphertext with decryption key
        decryptedValue = abi.decode(_decrypt(encryptedValue, decryptionKey), (uint256));
    }
}