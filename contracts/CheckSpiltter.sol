// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICheckSplitter.sol";

contract CheckSplitter is ICheckSplitter {
    address public owner = msg.sender;
    address[] public participants;
    mapping(address => bool) public isParticipant;
    mapping(address => uint256) public shares;
    uint256 public totalBill;
    bool public billInitialized;

    /// @notice Restricts access to the contract owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    /// @notice Ensures only registered participants can call certain functions.
    modifier onlyParticipant() {
        require(
            isParticipant[msg.sender],
            "You are not a registered participant."
        );
        _;
    }

    // @inheritdoc ICheckSplitter
    function registerParticipant(
        address participant
    ) external override onlyOwner {
        require(!isParticipant[participant], "Participant already registered.");
        require(participant != address(0), "Invalid participant address.");

        participants.push(participant);
        isParticipant[participant] = true;
    }

    function initializeBill(uint256 amount) external override onlyOwner {
        require(!billInitialized, "Bill already initialized.");
        require(amount > 0, "Bill amount must be greater than 0.");

        totalBill = amount;
        billInitialized = true;
    }

    /// @inheritdoc ICheckSplitter
    /// @dev Allows a participant to withdraw a specified amount of Ether from their contribution.
    /// @param amount The amount the participant wants to withdraw.
    //  The withdrawal amount must be greater than zero and have enough contributed balance to withdraw the requested amount.
    //  Will emit the withdrawal event
    function withdraw(uint256 amount) external override onlyParticipant {
        require(amount > 0, "Withdrawal amount must be greater than 0.");
        require(
            shares[msg.sender] >= amount,
            "Insufficient balance to withdraw."
        );

        shares[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }

    // @inheritdoc ICheckSplitter
    function contribute(
        uint256 amount
    ) external payable override onlyParticipant {
        require(billInitialized, "Bill has not been initialized yet.");
        require(amount > 0, "Contribution amount must be greater than 0.");
        require(
            msg.value == amount,
            "Sent value does not match declared amount."
        );

        // Calculate equal share per participant
        uint256 sharePerPerson = totalBill / participants.length;

        // Get current participant's total contribution including this one
        uint256 totalContribution = shares[msg.sender] + amount;

        // Ensure participant doesn't overpay their share
        require(
            totalContribution <= sharePerPerson,
            "Cannot contribute more than your share."
        );

        // Update the participant's contribution
        shares[msg.sender] += amount;

        // Emit the contribution event
        emit ContributionMade(msg.sender, amount);
    }

    // @inheritdoc ICheckSplitter
    function transferRemaining() external override onlyOwner {
        require(billInitialized, "Bill has not been initialized.");

        // Calculate the share per participant
        uint256 sharePerPerson = totalBill / participants.length;

        // Verify all participants have contributed their full share
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            require(
                shares[participant] >= sharePerPerson,
                "Not all participants have paid their share."
            );
        }

        // Get the remaining contract balance
        uint256 contractBalance = address(this).balance;

        // Ensure there is a remaining balance to transfer
        require(contractBalance > 0, "No remaining balance to transfer.");

        // Transfer the remaining balance to the owner
        payable(owner).transfer(contractBalance);

        // Emit the transfer event
        emit RemainingBalanceTransferred(owner, contractBalance);
    }

    function getParticipantDetails(
        address participant
    )
        external
        view
        returns (uint256 amountPaid, bool hasPaid, uint256 amountOwed)
    {
        require(
            isParticipant[participant],
            "Address is not a registered participant."
        );

        // Gets the amount paid by the participants
        amountPaid = shares[participant];

        // Determine if they have made any payment
        hasPaid = amountPaid > 0;

        // Calculates the share per person depening on the total and amount of participants
        uint256 sharePerPerson = totalBill / participants.length;

        amountOwed = sharePerPerson - amountPaid;
    }

    /// @dev Allows the contract to receive Ether payments.
    receive() external payable {}
}
