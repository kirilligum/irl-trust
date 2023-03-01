const {ethers} = require("hardhat");
const {expect} = require("chai");
const {
  deployContracts,
  deployAndSetupPool,
  advanceClock,
  checkRecord,
  checkResult,
  getCreditInfo,
  toToken,
  setNextBlockTimestamp,
  mineNextBlockWithTimestamp,
  evmSnapshot,
  evmRevert,
} = require("./BaseTest");

const getLoanContractFromAddress = async function (address, signer) {
  return ethers.getContractAt("HumaLoan", address, signer);
};

describe("Base Credit Pool", function () {
  let poolContract;
  let poolConfigContract;
  let hdtContract;
  let humaConfigContract;
  let feeManagerContract;
  let testTokenContract;
  let proxyOwner;
  let poolOwner;
  let lender;
  let borrower;
  let treasury;
  let evaluationAgent;
  let protocolOwner;
  let eaNFTContract;
  let eaServiceAccount;
  let pdsServiceAccount;
  let record;
  let recordStatic;
  let poolOperator;
  let poolOwnerTreasury;
  let sId;
  let maxWithdrawSchedule = [
    Math.floor(new Date().getTime() / 1000)+3600,
    Math.floor((new Date().getTime() / 1000))+7200,
    Math.floor((new Date().getTime() / 1000))+10800,
  ]
  console.log(maxWithdrawSchedule)
  const maxWithdrawInSchedule = [
    ethers.utils.parseUnits('200','ether'),
    ethers.utils.parseUnits('100','ether'),
    ethers.utils.parseUnits('50','ether'),
  ];
  const maxRepaySchedule = [
    Math.floor((new Date().getTime() / 1000))+7200,
    Math.floor((new Date().getTime() / 1000))+10800,
    Math.floor((new Date().getTime() / 1000))+14400,
  ]
  const maxRepayInSchedule = [
    ethers.utils.parseUnits('50','ether'),
    ethers.utils.parseUnits('100','ether'),
    ethers.utils.parseUnits('200','ether'),
  ];
  before(async function () {
    [
      defaultDeployer,
      proxyOwner,
      lender,
      borrower,
      treasury,
      evaluationAgent,
      poolOwner,
      protocolOwner,
      eaServiceAccount,
      pdsServiceAccount,
      poolOperator,
      poolOwnerTreasury,
    ] = await ethers.getSigners();
    [humaConfigContract, feeManagerContract, testTokenContract, eaNFTContract] =
      await deployContracts(
        poolOwner,
        treasury,
        lender,
        protocolOwner,
        eaServiceAccount,
        pdsServiceAccount
      );
    [hdtContract, poolConfigContract, poolContract] = await deployAndSetupPool(
      poolOwner,
      proxyOwner,
      evaluationAgent,
      lender,
      humaConfigContract,
      feeManagerContract,
      testTokenContract,
      0,
      eaNFTContract,
      false, // BaseCreditPool
      poolOperator,
      poolOwnerTreasury,
      borrower,
      maxWithdrawSchedule,
      maxWithdrawInSchedule,
      maxRepaySchedule,
      maxRepayInSchedule
    );

    await poolConfigContract.connect(poolOwner).setWithdrawalLockoutPeriod(90);
    await poolConfigContract.connect(poolOwner).setPoolDefaultGracePeriod(60);
  });

  beforeEach(async function () {
    sId = await evmSnapshot();
  });

  afterEach(async function () {
    if (sId) {
      const res = await evmRevert(sId);
    }
  });

  describe("")
})
