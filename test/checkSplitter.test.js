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

});