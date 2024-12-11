const CheckSplitter = artifacts.require("CheckSplitter");

module.exports = async function (callback) {
    try {
        // Get accounts from Ganache
        const accounts = await web3.eth.getAccounts();
        const owner = accounts[0]; // Owner
        const participant1 = accounts[1];
        const participant2 = accounts[2];
        const participant3 = accounts[3];

        console.log("Owner address:", owner);
        console.log("Participant 1 address:", participant1);
        console.log("Participant 2 address:", participant2);
        console.log("Participant 3 address:", participant3);

        // Deploy the contract
        const instance = await CheckSplitter.deployed();
        console.log("Contract deployed at:", instance.address);

        // Register participants
        console.log("Registering participants...");
        await instance.registerParticipant(participant1, { from: owner });
        await instance.registerParticipant(participant2, { from: owner });
        await instance.registerParticipant(participant3, { from: owner });
        console.log("Participants registered successfully!");

        // Verify participants
        const isRegistered1 = await instance.isParticipant(participant1);
        const isRegistered2 = await instance.isParticipant(participant2);
        const isRegistered3 = await instance.isParticipant(participant3);
        console.log("Is Participant 1 registered?", isRegistered1);
        console.log("Is Participant 2 registered?", isRegistered2);
        console.log("Is Participant 3 registered?", isRegistered3);

        // Initialize the bill
        console.log("Initializing bill...");
        const totalBill = 3000; // 3000 wei total bill
        await instance.initializeBill(totalBill, { from: owner });
        console.log("Bill initialized with amount:", totalBill);

        // Participants contribute to the bill
        console.log("Participants contributing...");
        console.log(`Participant 1 contributing 1000 wei...`);
        await instance.contribute(1000, { from: participant1, value: 1000 }); // Participant 1 contributes 1000 wei
        console.log("Participant 1 contribution successful!");

        console.log(`Participant 2 contributing 500 wei...`);
        await instance.contribute(500, { from: participant2, value: 500 });   // Participant 2 contributes 500 wei
        console.log("Participant 2 contribution successful!");

        // Participant 2 withdraws some funds
        console.log("Participant 2 withdrawing 200 wei...");
        await instance.withdraw(200, { from: participant2 }); // Participant 2 withdraws 200 wei
        console.log("Participant 2 withdrawal successful!");

        // Participant 2 contributes more to match their share
        console.log("Participant 2 contributing additional 700 wei...");
        await instance.contribute(700, { from: participant2, value: 700 }); // Now total contribution = 1000 wei
        console.log("Participant 2 additional contribution successful!");

        // Participant 3 contributes their full share
        console.log(`Participant 3 contributing 1000 wei...`);
        await instance.contribute(1000, { from: participant3, value: 1000 }); // Participant 3 contributes 1000 wei
        console.log("Participant 3 contribution successful!");

        // Check contract balance after contributions
        const contractBalanceAfterContributions = await web3.eth.getBalance(instance.address);
        console.log("Contract balance after contributions:", contractBalanceAfterContributions);

        // Transfer remaining balance to the owner
        console.log("Transferring remaining balance to the owner...");
        await instance.transferRemaining({ from: owner });
        console.log("Remaining balance transferred!");

        // Check contract balance after transfer
        const contractBalanceAfterTransfer = await web3.eth.getBalance(instance.address);
        console.log("Contract balance after transfer:", contractBalanceAfterTransfer);

        // Final confirmation
        console.log("Contract fulfilled! The bill has been fully paid, and the remaining balance has been transferred to the owner.");

        // End script
        callback();
    } catch (error) {
        console.error("Error running script:", error);
        callback(error);
    }
};
