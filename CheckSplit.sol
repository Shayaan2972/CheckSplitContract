// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Check Splitting Interface and Contract
/// @Splits a bill among participants
interface ICheckSpiltter{

    /// @dev Emitted when the bill is split among participants.
    /// @param totalAmount The total Ether amount to be split.
    /// @param numParticipants The number of participants involved.
    /// @param perParticipant The amount allocated to each participant.
    event EtherSplit(
        uint256 totalAmount,
        uint256 numParticipants,
        uint256 perParticipant
    );

    /// @dev Emitted when a participant withdraws an amount.
    /// @param participant The address of the participant who is withdrawing.
    /// @param amountWithdrawn The amount withdrawn.
    event Withdrawal(
        address indexed participant, 
        uint256 amountWithdrawn 
    );

    /// @dev Emitted when a participant contibutes an amount.
    /// @param participant The address of the participant who is contributing.
    /// @param contributionAmount The amount contributed.
    event ContributionMade(
        address indexed participant, 
        uint256 contributionAmount        
    );

    /// @dev Registers a participant for check splitting.
    /// @param participant The address of the participant who is registering.
    function registerParticipant(address participant) external;

    /// @dev Initializes the bill to be divided.
    /// @param amount The total amount of the bill.    
    function initializeBill(uint256 amount) external;

    /// @dev Allows a participant to withdraw an amount.
    function withdraw(uint256 amount) external; 

    /// @dev Allows a participant to contribute to the total.
    function contribute(uint256 amount) external; 

    /// @dev Transfer remaining balance to the owner after bill is finalized.
    function transferRemaining () external;

};