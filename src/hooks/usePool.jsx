import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { useAccount, useContract, useSigner } from 'wagmi'
import Static from '../public/Static.json'

import { useCeramicContext } from '../composedb/context'

const mapPeriod = (item) => {
  switch (item) {
    case 'day':
      return 3600 * 24
    case 'week':
      return 3600 * 24 * 7
    case 'month':
      return 3600 * 24 * 30
    case 'year':
      return 3600 * 24 * 365
  }
}
export const useProposal = () => {
  //for ceramic
  const clients = useCeramicContext()
  const { composeClient } = clients

  const { address, isConnected } = useAccount()
  const [borrower, setBorrower] = useState("")
  const [evaluationAgent, setEvaluationAgent] = useState(Static.addresses.evaluationAgent)
  const [poolOwner, setPoolOwner] = useState(Static.addresses.poolOwner)
  const [protocolOwner, setProtocolOwner] = useState(Static.addresses.protocolOwner)
  const [name, setName] = useState("sewing machine")
  const [withdrawPeriodLength, setWithdrawPeriodLength] = useState("day")
  const [maxWithdrawPerPeriod, setMaxWithdrawPerPeriod] = useState(0)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [lenders, setLenders] = useState([])
  const [intervalInDays, setIntervalInDays] = useState(12)
  const [aprInBps, setAprInBps] = useState(30)
  const [liquidityCap, setLiquidityCap] = useState(
    ethers.utils.parseUnits('1000000', 'ether')
  )
  const [pool, setPool] = useState({})
  const { data: signer, isError, isLoading } = useSigner()

  const submitTerms = useCallback(async () => {
    let queryString = `
    mutation {
      createIrl_Term_Sheet(input:{
        content:{
          PoolName: "TESTDATA"
          TermsDescription: "TESTDATA"
          AmountPerPeriod: "500"
          LoanPaidTo: "0x8243hj32jhdfsjhhgjfds"
          LoanEndDate: "2023-09-20"
          APR: "6.23"
          RepaymentStartDate: "2023-04-20"
          RepaymentEndDate: "2023-12-20"
          URL: "https://irltrust.xyz/djc8s"
        }
      })
      {
        document{
          id
          PoolName
          TermsDescription
          
        }
      }
    }
    `
    const ts = await composeClient.executeQuery(queryString)

    console.log("querystring: ", queryString)
    console.log("ts: ", ts)
  }, [])

  const getTerms = useCallback(() => {
  }, [])

  const deployHDT = useCallback(async () => {
    if (!isError && !isLoading) {
      console.log('tup')
      const TUP = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.TransparentUpgradeableProxy.abi),
        Static.TransparentUpgradeableProxy.bytecode,
        signer
      )
      console.log('hdt')
      const HDT = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.HDT.abi),
        Static.HDT.bytecode,
        signer
      )
      console.log('hdtimpl deploy')
      const hdtImpl = await HDT.deploy()
      await hdtImpl.deployed()
      console.log('hdtproxy (tup) deploy')
      const hdtProxy = await TUP.deploy(
        hdtImpl.address,
        Static.addresses.proxyOwner,
        []
      )
      await hdtProxy.deployed()
      const hdt = HDT.attach(hdtProxy.address)
      await hdt.initialize(
        name + 'HDT',
        "CHDT",
        Static.TestToken.address
      )
      return hdt
    }
  }, [])

  const deployPoolConfig = useCallback(async (hdtAddr) => {
    if (!isError && !isLoading && hdtAddr) {
      const PoolConfig = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.PoolConfig.abi),
        Static.PoolConfig.bytecode,
        signer
      )
      const poolConfig = await PoolConfig.deploy();
      await poolConfig.deployed()
      await poolConfig.initialize(
        name,
        hdtAddr,
        Static.HumaConfig.address,
        Static.BaseFeeManager.address,
        Static.PoolStarter.address
      )
      return poolConfig
    }
  }, [])

  const deployPool = useCallback(async (poolConfigAddr) => {
    if (!isError && !isLoading && poolConfigAddr) {
      const TUP = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.TransparentUpgradeableProxy.abi),
        Static.TransparentUpgradeableProxy.bytecode,
        signer
      )
      const BaseCreditPool = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.BaseCreditPool.abi),
        Static.BaseCreditPool.bytecode,
        signer
      )
      const baseCreditPoolImpl = await BaseCreditPool.deploy()
      await baseCreditPoolImpl.deployed()

      const poolProxy = await TUP.deploy(
        baseCreditPoolImpl.address,
        Static.addresses.proxyOwner,
        []
      )
      await poolProxy.deployed()
      const pool = BaseCreditPool.attach(
        poolProxy.address
      )
      await pool.initialize(
        poolConfigAddr,
        address,
        lenders,
        mapPeriod(withdrawPeriodLength),
        ethers.utils.parseUnits(String(maxWithdrawPerPeriod), 'ether'),
        Math.floor(endDate.getTime() / 1000),
        intervalInDays,
        aprInBps
      )
      await pool.deployed()
      return pool
    }
  }, [])

  const configurePool = useCallback(async (
    endDate, pool, poolConfig, hdt) => {
    if (!isError && !isLoading) {
      await poolConfig.setPool(pool.address)
      await hdt.setPool(pool.address)
      console.log('liquidity cap')
      await poolConfig.setPoolLiquidityCap(
        ethers.utils.parseUnits(`${(
          (Math.floor(endDate.getTime() / 1000) -
            Math.floor(new Date().getTime() / 1000)) /
          mapPeriod(withdrawPeriodLength)
        ) * maxWithdrawPerPeriod
          }`, 'ether')
      )
      console.log('pool owner rewards')
      await poolConfig.setPoolOwnerRewardsAndLiquidity(0, 0)

      console.log('nftid')
      await poolConfig.setEvaluationAgent(Static.eaNFTTokenId, Static.addresses.evaluationAgent)
      console.log('ea rewards')
      await poolConfig.setEARewardsAndLiquidity(0, 0)
      await poolConfig.setPoolOwnerTreasury(Static.addresses.poolOwnerTreasury)
      await poolConfig.addPoolOperator(Static.addresses.poolOwner)
      await poolConfig.addPoolOperator(Static.addresses.poolOperator)
    }
  }, [])

  const createPool = useCallback(async (
  ) => {
    console.log('deploying hdt')
    const hdt = await deployHDT()
    console.log('deploying poolconfig')
    const poolConfig = await deployPoolConfig(hdt.address)
    console.log('deploying pool')
    const pool = await deployPool(poolConfig.address)
    console.log('configuring pool')
    await configurePool(endDate, pool, poolConfig, hdt)
    setPool(pool)
  }, [])

  useEffect(() => {
    if (isConnected) {
      setBorrower(address)
    }
  }, [isConnected])

  return {
    name, setName,
    withdrawPeriodLength, setWithdrawPeriodLength,
    maxWithdrawPerPeriod, setMaxWithdrawPerPeriod,
    endDate, setEndDate,
    lenders, setLenders,
    intervalInDays, setIntervalInDays,
    aprInBps, setAprInBps,
    submitTerms,
    getTerms,
    createPool
  }
}
