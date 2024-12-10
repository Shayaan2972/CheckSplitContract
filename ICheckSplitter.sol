// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Check Splitting Interface and Contract
/// Splits a bill among participants
interface ICheckSplitter{

    /// @dev Emitted when the bill is split among participants.
    /// @param totalAmount The total Ether amount to be split.
    /// @param participants is an array of the participant's addresses.
    /// @param shares is an array of the percentages of what each participant owes and can be either all the same or custom. 
    event EtherSplit(
        uint256 totalAmount,
        address [] participants,
        uint256 [] shares
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

}

contract CheckSplitter is ICheckSplitter {
    struct Participant {
        uint contribution;
        bool hasPaid;
    }

    address public owner;
    uint public totalAmount;
    uint public totalContributed;
    mapping(address => Participant) public participants;
    address[] public participantList;
    bool public isCompleted;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    /// @param _totalAmount The total amount to be split
    /// @param _participants List of participant addresses
    constructor(uint _totalAmount, address[] memory _participants) public {
        require(_totalAmount > 0, "The total has to be greater than 0!");
        require(_participants.length > 0, "There has to be at least one participant!");

        owner = msg.sender;
        totalAmount = _totalAmount;
        participantList = _participants;

        for (uint i = 0; i < _participants.length; i++) {
            participants[_participants[i]] = Participant(0, false);
        }
    }

    function registerParticipant(address participant) external override onlyOwner {
        require(participant != address(0), "Invalid participant address.");
        require(participants[participant].contribution == 0 && !participants[participant].hasPaid, "Participant already registered.");
        participants[participant] = Participant(0, false);
        participantList.push(participant);
    }

    function initializeBill(uint256 amount) external {
       
    }

    function withdraw(uint256 amount) external  {
        
    }

    function contribute(uint256 amount) external  {
        
    }

    function transferRemaining() external  {
        
    }
}