const {ethers, network} = require("hardhat");
const {expect} = require("chai");
const {BigNumber: BN} = require("ethers");
const {hasRestParameter} = require("typescript");
const { getSafeTemplate } = require('./gnosis-safe-mock.js')
const fs = require('fs')
function toBN(number, decimals) {

  return BN.from(number).mul(BN.from(10).pow(BN.from(decimals)));
}

function toToken(number) {
  return toBN(number, 6);
}

async function deployContracts(
) {
  const [
    borrowerA,
    lenderA,
    lenderB,
    borrowerB,
    poolOwner,
    poolOperator,
    poolOwnerTreasury,
    proxyOwner,
    treasury,
    evaluationAgent,
    protocolOwner,
    eaServiceAccount,
    pdsServiceAccount,
  ] = await ethers.getSigners()
  
  const maxWithdrawPeriodLength = 3600
  const maxWithdrawAmountPerPeriod = toToken(1_000)
  const endDate = Math.floor(new Date().getTime()/ 1000)
  const template = await getSafeTemplate()
  const safeOneSetup = await template.setup(
    [lenderA.address, borrowerA.address], //address[] calldata _owners,
    2, //uint256 _threshold,
    ethers.constants.AddressZero,//address to,
    "0x",//bytes calldata data,
    ethers.constants.AddressZero,//address fallbackHandler,
    ethers.constants.AddressZero,//address paymentToken,
    0,//uint256 payment,
    ethers.constants.AddressZero//address payable paymentReceiver
  )
  const fees = [toToken(0), 0, toToken(0), 0, 0]
  const principalRateInBps = 0
  const isReceivableContractFlag = false
  // Deploy Pool Starter
  const PoolStarter = await ethers.getContractFactory("PoolStarter")
  const poolStarter = await PoolStarter.deploy()
  // Deploy EvaluationAgentNFT
  const EvaluationAgentNFT = await ethers.getContractFactory("EvaluationAgentNFT");
  eaNFTContract = await EvaluationAgentNFT.deploy();
  console.log('Aprs and max credit lines')

  // Deploy HumaConfig
  const HumaConfig = await ethers.getContractFactory("HumaConfig");
  humaConfigContract = await HumaConfig.deploy();
  // await humaConfigContract.setHumaTreasury(treasury.address);
  await humaConfigContract.setHumaTreasury(treasury.address);
  await humaConfigContract.setTreasuryFee(2000);
  await humaConfigContract.addPauser(poolOwner.address);
  await humaConfigContract.setEANFTContractAddress(eaNFTContract.address);
  await humaConfigContract.setEAServiceAccount(eaServiceAccount.address);
  await humaConfigContract.setPDSServiceAccount(pdsServiceAccount.address);

  await humaConfigContract.transferOwnership(protocolOwner.address);
  await humaConfigContract.connect(protocolOwner).addPauser(protocolOwner.address);
  if (await humaConfigContract.connect(protocolOwner).paused())
    await humaConfigContract.connect(protocolOwner).unpause();

  // Deploy Fee Manager
  const feeManagerFactory = await ethers.getContractFactory("BaseFeeManager");
  feeManagerContract = await feeManagerFactory.deploy();
  await feeManagerContract.transferOwnership(poolOwner.address);
  await feeManagerContract
    .connect(poolOwner)
    .setFees(fees[0], fees[1], fees[2], fees[3], fees[4]);

  // Deploy TestToken, give initial tokens to lender
  const TestToken = await ethers.getContractFactory("TestToken");
  testTokenContract = await TestToken.deploy();

  await humaConfigContract
    .connect(protocolOwner)
    .setLiquidityAsset(testTokenContract.address, true);


  await testTokenContract.mint(lenderA.address, toToken(10_000_000));
  await testTokenContract.mint(lenderB.address, toToken(10_000_000));
  await testTokenContract.mint(poolOwnerTreasury.address, toToken(10_000_000));
  await testTokenContract.mint(evaluationAgent.address, toToken(10_000_000));

  await feeManagerContract.connect(poolOwner).setMinPrincipalRateInBps(principalRateInBps);

  const TransparentUpgradeableProxyOne = await ethers.getContractFactory(
    "TransparentUpgradeableProxy"
  );
  const TransparentUpgradeableProxyTwo = await ethers.getContractFactory(
    "TransparentUpgradeableProxy"
  );

  const HDTOne = await ethers.getContractFactory("HDT");
  const HDTTwo = await ethers.getContractFactory("HDT");
  const hdtImplOne = await HDTOne.deploy();
  const hdtImplTwo = await HDTTwo.deploy();
  await hdtImplOne.deployed();
  await hdtImplTwo.deployed();
  const hdtProxyOne = await TransparentUpgradeableProxyOne.deploy(
    hdtImplOne.address,
    proxyOwner.address,
    []
  );
  const hdtProxyTwo = await TransparentUpgradeableProxyTwo.deploy(
    hdtImplTwo.address,
    proxyOwner.address,
    []
  );
  await hdtProxyOne.deployed();
  await hdtProxyTwo.deployed();
  const hdtContractOne = HDTOne.attach(hdtProxyOne.address);
  const hdtContractTwo = HDTOne.attach(hdtProxyTwo.address);
  await hdtContractOne.initialize("Base Credit HDTOne", "CHDTOne", testTokenContract.address);
  await hdtContractTwo.initialize("Base Credit HDTTwo", "CHDTTwo", testTokenContract.address);

  const BasePoolConfigOne = await ethers.getContractFactory("BasePoolConfig");
  const BasePoolConfigTwo = await ethers.getContractFactory("BasePoolConfig");
  const poolConfigOne = await BasePoolConfigOne.deploy();
  const poolConfigTwo = await BasePoolConfigTwo.deploy();
  await poolConfigOne.deployed();
  await poolConfigTwo.deployed();
  await poolConfigOne.initialize(
    "Base Credit Pool",
    hdtContractOne.address,
    humaConfigContract.address,
    feeManagerContract.address,
    poolStarter.address
  );
  await poolConfigTwo.initialize(
    "Base Credit Pool 2",
    hdtContractTwo.address,
    humaConfigContract.address,
    feeManagerContract.address,
    poolStarter.address
  );

  // Deploy pool contract
  let poolContractOneFactory;
  //let poolContractTwoFactory;
  poolContractOneFactory = await ethers.getContractFactory("BaseCreditPool");
  //poolContractTwoFactory = await ethers.getContractFactory("BaseCreditPool");

  const poolImplOne = await poolContractOneFactory.deploy();
  //const poolImplTwo = await poolContractOneFactory.deploy();
  //const BaseCreditPool = await ethers.getContractFactory("BaseCreditPool");
  //const poolImplOne = await BaseCreditPool.deploy();
  await poolImplOne.deployed();
  //await poolImplTwo.deployed();
  const poolProxyOne = await TransparentUpgradeableProxyOne.deploy(
    poolImplOne.address,
    proxyOwner.address,
    []
  );
  const poolProxyTwo = await TransparentUpgradeableProxyTwo.deploy(
    poolImplOne.address,
    proxyOwner.address,
    []
  );
  await poolProxyOne.deployed();
  await poolProxyTwo.deployed();

  const poolContractOne = poolContractOneFactory.attach(poolProxyOne.address);
  const poolContractTwo = poolContractOneFactory.attach(poolProxyTwo.address);
  await poolContractOne.initialize(
    poolConfigOne.address,
    borrowerA.address,
    [lenderA.address],
    maxWithdrawPeriodLength,
    maxWithdrawAmountPerPeriod,
    endDate,
    12,
    30
  );
  await poolContractTwo.initialize(
    poolConfigTwo.address,
    borrowerB.address,
    [lenderA.address, lenderB.address],
    maxWithdrawPeriodLength,
    maxWithdrawAmountPerPeriod,
    endDate,
    12,
    30
  );
  console.log('initialized')
  await poolContractOne.deployed();
  await poolContractTwo.deployed();
  console.log('poolContracts deployed')
  await poolConfigOne.setPool(poolContractOne.address);
  await hdtContractOne.setPool(poolContractOne.address);
  await poolConfigTwo.setPool(poolContractTwo.address);
  await hdtContractTwo.setPool(poolContractTwo.address);
  console.log('configs and hdt tokens defined')
  // Pool setup
  await poolConfigOne.transferOwnership(poolOwner.address);
  await poolConfigTwo.transferOwnership(poolOwner.address);
  console.log('pool Config Transfered ownership')
  // Config rewards and requirements for poolOwner and EA, make initial deposit, and enable pool
  await poolConfigOne.connect(poolOwner).setPoolLiquidityCap(toToken(1_000_000_000));
  await poolConfigOne.connect(poolOwner).setPoolOwnerRewardsAndLiquidity(0, 0);
  await poolConfigTwo.connect(poolOwner).setPoolLiquidityCap(toToken(1_000_000_000));
  await poolConfigTwo.connect(poolOwner).setPoolOwnerRewardsAndLiquidity(0, 0);
  console.log('liquidity caps and rewards configured')
  let eaNFTTokenId;
  // Mint EANFT to the ea
  const tx = await eaNFTContract.mintNFT(evaluationAgent.address);
  const receipt = await tx.wait();
  for (const evt of receipt.events) {
    if (evt.event === "NFTGenerated") {
      eaNFTTokenId = evt.args.tokenId;
    }
  }
  console.log('nfts generated')

  await poolConfigOne.connect(poolOwner).setEvaluationAgent(eaNFTTokenId, evaluationAgent.address);
  let s = await poolConfigOne.getPoolSummary();
  await poolConfigTwo.connect(poolOwner).setEvaluationAgent(eaNFTTokenId, evaluationAgent.address);

  await poolConfigOne.connect(poolOwner).setEARewardsAndLiquidity(0, 0);

  await poolConfigOne.connect(poolOwner).setPoolOwnerTreasury(poolOwnerTreasury.address);
  await poolConfigOne.connect(poolOwner).addPoolOperator(poolOwner.address);
  await poolConfigOne.connect(poolOwner).addPoolOperator(poolOperator.address);

  await poolConfigTwo.connect(poolOwner).setEARewardsAndLiquidity(0, 0);

  await poolConfigTwo.connect(poolOwner).setPoolOwnerTreasury(poolOwnerTreasury.address);
  await poolConfigTwo.connect(poolOwner).addPoolOperator(poolOwner.address);
  await poolConfigTwo.connect(poolOwner).addPoolOperator(poolOperator.address);
  /*
  console.log('pool operators, treasury owners and owners configured')
  await poolContractOne.connect(poolOperator).addApprovedLender(poolOwnerTreasury.address);
  await poolContractOne.connect(poolOperator).addApprovedLender(evaluationAgent.address);
  await poolContractOne.connect(poolOperator).addApprovedLender(lenderA.address);

  await poolContractTwo.connect(poolOperator).addApprovedLender(poolOwnerTreasury.address);
  await poolContractTwo.connect(poolOperator).addApprovedLender(evaluationAgent.address);
  await poolContractTwo.connect(poolOperator).addApprovedLender(lenderA.address);
  await poolContractTwo.connect(poolOperator).addApprovedLender(lenderB.address);
  */
  console.log('lenders configured')
  await testTokenContract
    .connect(poolOwnerTreasury)
    .approve(poolContractOne.address, toToken(1_000_000));
  //await poolContractOne.connect(poolOwnerTreasury).makeInitialDeposit(toToken(1_000_000));
  console.log('initial deposit one')
  await testTokenContract
    .connect(poolOwnerTreasury)
    .approve(poolContractTwo.address, toToken(1_000_000));
  //await poolContractTwo.connect(poolOwnerTreasury).makeInitialDeposit(toToken(1_000_000));
  console.log('initial deposit two')
  await testTokenContract
    .connect(evaluationAgent)
    .approve(poolContractOne.address, toToken(2_000_000));
  //await poolContractOne.connect(evaluationAgent).makeInitialDeposit(toToken(2_000_000));
  console.log('initial deposit evalAgent')
  await testTokenContract
    .connect(evaluationAgent)
    .approve(poolContractTwo.address, toToken(2_000_000));
  //await poolContractTwo.connect(evaluationAgent).makeInitialDeposit(toToken(2_000_000));
  console.log('initial deposit evalAgent pool 2')

  console.log('initial deposits made')
  /*await expect(poolContractOne.connect(poolOwner).enablePool()).to.emit(
    poolContractOne,
    "PoolEnabled"
  );
  await expect(poolContractTwo.connect(poolOwner).enablePool()).to.emit(
    poolContractTwo,
    "PoolEnabled"
  );
  */

  await poolConfigOne.connect(poolOwner).setAPR(1217);
  await poolConfigOne.connect(poolOwner).setMaxCreditLine(toToken(10_000_000));
  await poolConfigTwo.connect(poolOwner).setAPR(1217);
  await poolConfigTwo.connect(poolOwner).setMaxCreditLine(toToken(10_000_000));
  fs.writeFileSync('../src/public/Static.json', JSON.stringify({
    addresses: {
      poolOwner: poolOwner.address,
      poolOperator: poolOperator.address,
      poolOwnerTreasury: poolOwnerTreasury.address,
      protocolOwner: protocolOwner.address,
      eaServiceAccount: eaServiceAccount.address,
      pdsServiceAccount: pdsServiceAccount.address,
      evaluationAgent: evaluationAgent.address,
      proxyOwner: proxyOwner.address,
      lenderA: lenderA.address,
      lenderB: lenderB.address,
      borrowerA: borrowerA.address,
      borrowerB: borrowerB.address
    },
    TestToken: {
      address: testTokenContract.address,
      abi: require('../artifacts/contracts/mock/TestToken.sol/TestToken.json').abi
    },
    PoolStarter: {
      address: poolStarter.address,
      abi: require('../artifacts/contracts/PoolStarter.sol/PoolStarter.json').abi
    },
    EaNFTContract: {
      address: eaNFTContract.address,
      abi: require('../artifacts/contracts/EvaluationAgentNFT.sol/EvaluationAgentNFT.json').abi
    },
    HumaConfig: {
      address: humaConfigContract.address,
      abi: require('../artifacts/contracts/HumaConfig.sol/HumaConfig.json').abi
    },
    BaseFeeManager: {
      address: feeManagerContract.address,
      abi: require('../artifacts/contracts/BaseFeeManager.sol/BaseFeeManager.json').abi
    },
    TransparentUpgradeableProxy: {
      abi: require('../artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json').abi,
      bytecode: require('../artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json').bytecode,
    },
    HDT: {
      abi: require('../artifacts/contracts/HDT/HDT.sol/HDT.json').abi,
      bytecode: require('../artifacts/contracts/HDT/HDT.sol/HDT.json').bytecode,
    },
    PoolConfig: {
      abi: require('../artifacts/contracts/BasePoolConfig.sol/BasePoolConfig.json').abi,
      bytecode: require('../artifacts/contracts/BasePoolConfig.sol/BasePoolConfig.json').bytecode,
    },
    BaseCreditPool: {
      abi: require('../artifacts/contracts/BaseCreditPool.sol/BaseCreditPool.json').abi,
      bytecode: require('../artifacts/contracts/BaseCreditPool.sol/BaseCreditPool.json').bytecode,
    },
    poolOne: {
      addressImpl: poolImplOne.address,
      addressProxy: poolProxyOne.address,
      abi: require('../artifacts/contracts/BaseCreditPool.sol/BaseCreditPool.json').abi
    },
    poolTwo: {
      addressImpl: poolImplOne.address,
      addressProxy: poolProxyTwo.address,
      abi: require('../artifacts/contracts/BaseCreditPool.sol/BaseCreditPool.json').abi
    },
    poolConfigOne: {
      address: poolConfigOne.address,
      abi: require('../artifacts/contracts/BasePoolConfig.sol/BasePoolConfig.json').abi
    },
    poolConfigTwo: {
      address: poolConfigTwo.address,
      abi: require('../artifacts/contracts/BasePoolConfig.sol/BasePoolConfig.json').abi
    },
    hDTOne: {
      addressImpl: hdtImplOne.address,
      addressProxy: hdtProxyOne.address,
      abi: require('../artifacts/contracts/HDT/HDT.sol/HDT.json').abi
    },
    hDTTwo: {
      addressImpl: hdtImplTwo.address,
      addressProxy: hdtProxyTwo.address,
      abi: require('../artifacts/contracts/HDT/HDT.sol/HDT.json').abi
    },
    testToken: {
      address: testTokenContract.address,
      abi: require('../artifacts/contracts/mock/TestToken.sol/TestToken.json').abi
    },
    poolStarter: {
      address: poolStarter.address,
      abi: require('../artifacts/contracts/PoolStarter.sol/PoolStarter.json').abi
    },
    eaNFTContract: {
      address: eaNFTContract.address,
      abi: require('../artifacts/contracts/EvaluationAgentNFT.sol/EvaluationAgentNFT.json').abi
    },
    humaConfig: {
      address: humaConfigContract.address,
      abi: require('../artifacts/contracts/HumaConfig.sol/HumaConfig.json').abi
    },
    BaseFeeManager: {
      address: feeManagerContract.address,
      abi: require('../artifacts/contracts/BaseFeeManager.sol/BaseFeeManager.json').abi
    }
  }))
  return {
    starter: {poolStarter},
    poolA: {hdtContractOne, poolConfigOne, poolContract:poolContractOne, poolImplOne, poolProxyOne},
    poolB: {hdtContractTwo, poolConfigTwo, poolContract:poolContractTwo, poolImplOne, poolProxyTwo},
    config: {humaConfigContract, feeManagerContract, testTokenContract, eaNFTContract},
    token: {testTokenContract},
    signers: {
      proxyOwner,
      lenderA,
      lenderB,
      borrowerA,
      borrowerB,
      treasury,
      evaluationAgent,
      poolOwner,
      protocolOwner,
      eaServiceAccount,
      pdsServiceAccount,
      poolOperator,
      poolOwnerTreasury,
    },
  }
}

if (require.main === module) {
  deployContracts()
    .then(() => {
      process.exit(1)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployContracts = deployContracts
exports.toToken = toToken
