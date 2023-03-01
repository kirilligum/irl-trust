const {ethers} = require("hardhat");
const {expect} = require("chai");
const  {deployContracts, toToken} = require('../scripts/irl-trust-deploy.js')
const getLoanContractFromAddress = async function (address, signer) {
  return ethers.getContractAt("HumaLoan", address, signer);
};
const {
  evmSnapshot,
  evmRevert,
} = require("./BaseTest");

describe("Base Credit Pool", function () {
  let poolA
  let poolB
  let config
  let token
  let signers
  before(async function () {
    (
      {poolA, poolB, config, token, signers } = await deployContracts()
    )
    await poolA.poolConfigOne.connect(signers.poolOwner).setWithdrawalLockoutPeriod(90);
    await poolA.poolConfigOne.connect(signers.poolOwner).setPoolDefaultGracePeriod(60);
    await poolB.poolConfigTwo.connect(signers.poolOwner).setWithdrawalLockoutPeriod(90);
    await poolB.poolConfigTwo.connect(signers.poolOwner).setPoolDefaultGracePeriod(60);
  });

  beforeEach(async function () {
    sId = await evmSnapshot();
  });

  afterEach(async function () {
    if (sId) {
      const res = await evmRevert(sId);
    }
  });

  describe("workflow", async () => {

    it("Initial Parameters make sense", async () => {
      const borrowerInPoolA = await poolA.poolContract._approvedBorrower()
      expect(borrowerInPoolA).to.be.equal(signers.borrowerA.address)
      const borrowerInPoolB = await poolB.poolContract._approvedBorrower()
      expect(borrowerInPoolB).to.be.equal(signers.borrowerB.address)

      const isLenderAinPoolA = await poolA.poolContract._approvedLenders(signers.lenderA.address)
      expect(isLenderAinPoolA).to.be.true;
      const isLenderBinPoolA = await poolA.poolContract._approvedLenders(signers.lenderB.address)
      expect(isLenderBinPoolA).to.be.false;
      const isLenderAinPoolB = await poolB.poolContract._approvedLenders(signers.lenderA.address)
      expect(isLenderAinPoolB).to.be.true
      const isLenderBinPoolB = await poolB.poolContract._approvedLenders(signers.lenderB.address)
      expect(isLenderBinPoolB).to.be.true
      const poolATokens = await token.testTokenContract.balanceOf(poolA.poolContract.address)
      expect(poolATokens).to.be.equal(0)
      const poolBTokens = await token.testTokenContract.balanceOf(poolB.poolContract.address)
      expect(poolBTokens).to.be.equal(0)
      const depositAmount = toToken(2_000_000)
      await token.testTokenContract.connect(signers.lenderA).approve(poolA.poolContract.address, depositAmount);
      await token.testTokenContract.connect(signers.lenderA).approve(poolB.poolContract.address, depositAmount);
      await token.testTokenContract.connect(signers.lenderB).approve(poolB.poolContract.address, depositAmount);
      console.log('approvals complete')
      await poolA.poolContract.connect(signers.lenderA).deposit(depositAmount);
      await poolB.poolContract.connect(signers.lenderA).deposit(depositAmount);
      await poolB.poolContract.connect(signers.lenderB).deposit(depositAmount);
      const poolATokensTwo = await token.testTokenContract.balanceOf(poolA.poolContract.address)
      expect(poolATokensTwo).to.be.equal(depositAmount)
      const poolBTokensTwo = await token.testTokenContract.balanceOf(poolB.poolContract.address)
      expect(poolBTokensTwo).to.be.equal(depositAmount.add(depositAmount))



    })
  })
})
