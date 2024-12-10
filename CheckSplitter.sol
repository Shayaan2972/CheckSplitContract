// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICheckSplitter.sol";

/// @title Check Splitting Contract
/// @Splits a bill among participants

contract CheckSplitter is ICheckSplitter{

address public owner = msg.sender;
address[] public participant;
mapping(address => bool) public isParticipant;
mapping (address => uint256) public shares;
uint256 public totalBill;


// @inheritdoc ICheckSplitter 
function registerParticipant() external payable override {

require(msg.sender == owner, "Only the owner can register participants.");
require(shares[participant], "Participant already registered.");

participants.push(participant);
isParticipant[participant] = true;

}

function initializeBill(uint256 amount) external{
    require(msg.sender == owner, "Only the owner can initiliaze the bill.");
    require(!billInitalized, "Participant already registered.");
    require(amount > 0, "Bill amount must be greater than 0.");
    
    totalBill = amount;
    billInitalized = true;

}





}