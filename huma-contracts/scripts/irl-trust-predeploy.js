
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
    poolOwner,
    poolOperator,
    poolOwnerTreasury,
    proxyOwner,
    treasury,
    evaluationAgent,
    borrowerB,
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

  await testTokenContract.mint(lenderA.address, toToken(10_000_000));
  await testTokenContract.mint(lenderB.address, toToken(10_000_000));
  await testTokenContract.mint(poolOwnerTreasury.address, toToken(10_000_000));
  await testTokenContract.mint(evaluationAgent.address, toToken(10_000_000));

  await feeManagerContract.connect(poolOwner).setMinPrincipalRateInBps(principalRateInBps);

  fs.writeFileSync('../src/public/Static.json', JSON.stringify({
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
    addresses: {
      poolOwner: poolOwner.address,
      poolOperator: poolOperator.address,
      poolOwnerTreasury: poolOwnerTreasury.address,
      protocolOwner: protocolOwner.address,
      eaServiceAccount: eaServiceAccount.address,
      pdsServiceAccount: pdsServiceAccount.address,
      evaluationAgent: evaluationAgent.address,
      proxyOwner: proxyOwner.address
    },
    eaNFTTokenId: eaNFTTokenId
  }))
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
