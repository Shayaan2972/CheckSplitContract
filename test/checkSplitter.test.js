const CheckSplitter = artifacts.require("CheckSplitter");
const chai = require('chai');
const assert = chai.assert;

contract("CheckSplitter", (accounts) => {
  let checkSplitter;
  const owner = accounts[0];
  const participant1 = accounts[1];
  const participant2 = accounts[2];

  const oneEth = "1000000000000000000";  // 1 ETH in wei
  const halfEth = "500000000000000000";  // 0.5 ETH in wei

  beforeEach(async () => {
    checkSplitter = await CheckSplitter.new({ from: owner });
  });

  it("should set the owner correctly", async () => {
    const contractOwner = await checkSplitter.owner();
    assert.equal(contractOwner, owner, "Owner is not set correctly");
  });

  it("should not allow non-owner to register participant", async () => {
    try {
      await checkSplitter.registerParticipant(participant2, { from: participant1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Only the owner can call this function");
    }
  });
  
  it("should not allow non-owner to initialize bill", async () => {
    try {
      await checkSplitter.initializeBill(oneEth, { from: participant1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Only the owner can call this function");
    }
  });

 it("should allow the owner to register participants", async () =>{
    // Try reigstering participant
    await checkSplitter.registerParticipant(participant1, {from: owner });

    // Test for participant registration
    const isRegistered = await checkSplitter.isParticipant(participant1);
    assert.equal(isRegistered, true, "Participant was not registered.");

  });

  it("should not allow duplicate registration of a participant", async () =>{
  // Reigster particpant
  await checkSplitter.registerParticipant(participant1, {from: owner });

  // Re-register participant and throw error if so
    try{
      await checkSplitter.registerParticipant(participant1, {from: owner });
      assert.fail("An error due to double registration should have been thrown.")
    } catch (error){
      assert.include(error.message, "Participant already registered.")
    }
  });

  it("should not allow registration of zero addresss", async () =>{
    // Register invalid participant 
    try{
      await checkSplitter.registerParticipant(0x0000000000000000000000000000000000000000, {from: owner });
      assert.fail("An error due to zero address should have been thrown.")
    } catch (error){
      assert.include(error.message, "Invalid participant address.")
    }
  });

  it("should allow the owner to initialize bill", async () =>{
    // Try initializaing bill
    await checkSplitter.initializeBill(oneEth, {from: owner });

    // Test for bill initialization
    const totalBill = await checkSplitter.totalBill();
    assert.equal(totalBill.toString(), oneEth, "The bill was not initialized.");

  });

  it("should not allow the bill to be initialized multiple times", async () =>{
    // Try initializing bill
    await checkSplitter.initializeBill(oneEth, {from: owner });
  
    // Re-initialize bill
      try{
        await checkSplitter.initializeBill(oneEth, {from: owner });
        assert.fail("An error due to instantiating more than once should have been thrown.")
      } catch (error){
        assert.include(error.message, "Bill already initialized.")
      }
    });

  it("should not allow bill to be initialized with an amount of 0", async () =>{
    // Initialize bill with 0
    try{
      await checkSplitter.initializeBill("0", {from: owner });
      assert.fail("An error due to instantiating with 0 eth should have been thrown.")
    } catch (error){
      assert.include(error.message, "Bill can not be initialized with 0 eth.")
    }
  });

  it("should allow participant to withdraw", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
    
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
    
    const initialBalance = await web3.eth.getBalance(participant1);
    await checkSplitter.withdraw(halfEth, { from: participant1 });
    const finalBalance = await web3.eth.getBalance(participant1);
    
    assert(finalBalance > initialBalance, "Balance should have increased after withdrawal");
  });

  it("should not allow withdrawal without being participant", async () => {
    try {
      await checkSplitter.withdraw(halfEth, { from: participant1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "You are not a registered participant");
    }
  });
  
  it("should not allow withdrawal of zero amount", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
    
    try {
      await checkSplitter.withdraw(0, { from: participant1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Withdrawal amount must be greater than 0");
    }
  });
  
  it("should not allow withdrawal more than contributed", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
    
    try {
      await checkSplitter.withdraw(halfEth, { from: participant1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Insufficient balance to withdraw");
    }
  });

  // contribution general tests
  it("should allow participant to contribute", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
    
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
    
    const details = await checkSplitter.getParticipantDetails(participant1);
    assert.equal(details.amountPaid.toString(), halfEth, "Contribution amount incorrect");
  });

  it("should allow multiple participants to contribute", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
    await checkSplitter.contribute(halfEth, { 
      from: participant2, 
      value: halfEth 
    });
  
    const details1 = await checkSplitter.getParticipantDetails(participant1);
    const details2 = await checkSplitter.getParticipantDetails(participant2);
  
    assert.equal(details1.amountPaid.toString(), halfEth, "Participant 1 contribution incorrect");
    assert.equal(details2.amountPaid.toString(), halfEth, "Participant 2 contribution incorrect");
  });
  
  it("should allow partial contributions by a participant", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
  
    const details = await checkSplitter.getParticipantDetails(participant1);
    assert.equal(details.amountPaid.toString(), oneEth, "Total contribution incorrect");
  });
  
  it("should allow a participant to contribute their exact share", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    const sharePerParticipant = oneEth / 2;
    await checkSplitter.contribute(sharePerParticipant.toString(), { 
      from: participant1, 
      value: sharePerParticipant.toString() 
    });
  
    const details = await checkSplitter.getParticipantDetails(participant1);
    assert.equal(details.amountPaid.toString(), sharePerParticipant, "Contribution does not match exact share");
  });
  
  it("should correctly track remaining contract balance after contributions", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    await checkSplitter.contribute(halfEth, { 
      from: participant1, 
      value: halfEth 
    });
    await checkSplitter.contribute(halfEth, { 
      from: participant2, 
      value: halfEth 
    });
  
    const contractBalance = await web3.eth.getBalance(checkSplitter.address);
    assert.equal(contractBalance.toString(), oneEth, "Contract balance incorrect after contributions");
  });

  // contribution edge case tests
  it("should not allow non-participant to contribute", async () => {
    try {
      await checkSplitter.contribute(oneEth, { from: participant1, value: oneEth });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "You are not a registered participant");
    }
  });
  
  it("should not allow contribution before bill is initialized", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
  
    try {
      await checkSplitter.contribute(halfEth, { from: participant1, value: halfEth });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Bill has not been initialized yet");
    }
  });
  
  it("should not allow contribution of zero amount", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    try {
      await checkSplitter.contribute(0, { from: participant1, value: 0 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Contribution amount must be greater than 0");
    }
  });
  
  it("should not allow contribution more than allowed share", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    // Participant tries to contribute more than their share
    try {
      await checkSplitter.contribute(oneEth, { from: participant1, value: oneEth });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Cannot contribute more than your share");
    }
  });
  
  it("should not allow contribution if msg.value and amount do not match", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.initializeBill(oneEth, { from: owner });
  
    try {
      await checkSplitter.contribute(halfEth, { from: participant1, value: oneEth });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.message, "Sent value does not match declared amount");
    }
  });

  // tests transfer remaining function
  it("should revert if bill is not initialized", async () => {
    await checkSplitter.registerParticipant(participant1, { from: owner });

    try {
      await checkSplitter.transferRemaining({ from: owner });
      assert.fail("Expected revert for uninitialized bill");
    } catch (error) {
      assert.include(
        error.message,
        "Bill has not been initialized",
        "Error message does not match"
      );
    }
  });

  it("should revert if not all participants have contributed their share", async () => {
    const billAmount = web3.utils.toWei("1", "ether"); // 1 ETH
    const halfEth = web3.utils.toWei("0.5", "ether"); // 0.5 ETH

    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(billAmount, { from: owner });

    // Only participant1 contributes
    await checkSplitter.contribute(halfEth, {
      from: participant1,
      value: halfEth,
    });

    try {
      await checkSplitter.transferRemaining({ from: owner });
      assert.fail("Expected revert for incomplete contributions");
    } catch (error) {
      assert.include(
        error.message,
        "Not all participants have paid their share",
        "Error message does not match"
      );
    }
  });

  it("should revert if a non-owner tries to call transferRemaining", async () => {
    const billAmount = web3.utils.toWei("1", "ether"); // 1 ETH
    const halfEth = web3.utils.toWei("0.5", "ether"); // 0.5 ETH

    await checkSplitter.registerParticipant(participant1, { from: owner });
    await checkSplitter.registerParticipant(participant2, { from: owner });
    await checkSplitter.initializeBill(billAmount, { from: owner });

    await checkSplitter.contribute(halfEth, { from: participant1, value: halfEth });
    await checkSplitter.contribute(halfEth, { from: participant2, value: halfEth });

    try {
      await checkSplitter.transferRemaining({ from: participant1 });
      assert.fail("Expected revert for unauthorized caller");
    } catch (error) {
      assert.include(
        error.message,
        "Only the owner can call this function",
        "Error message does not match"
      );
    }
  });
});
