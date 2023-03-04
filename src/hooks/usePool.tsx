import { useState, useCallback, useEffect } from 'react'
import {ethers} from 'ethers'
import { useAccount, useContract, useSigner } from 'wagmi'
import Static from '../public/Static.json'
export const useProposal = () => {
  const {address, isConnected} = useAccount()
  const [borrower, setBorrower] = useState("")
  const [evaluationAgent, setEvaluationAgent] = useState(Static.addresses.evaluationAgent)
  const [poolOwner, setPoolOwner] = useState(Static.addresses.poolOwner)
  const [protocolOwner, setProtocolOwner] = useState(Static.addresses.protocolOwner)
  const [name, setName] = useState("")
  const [withdrawPeriodLength, setWithdrawPeriodLength] = useState(0)
  const [maxWithdrawPerPeriod, setMaxWithdrawPerPeriod] = useState(0)
  const [endDate, setEndDate] = useState(new Date())
  const [lenders, setLenders] = useState([])
  const [intervalInDays, setIntervalInDays] = useState(12)
  const [aprInBps, setAprInBps]  = useState(30)
  const [liquidityCap, setLiquidityCap] = useState(
    ethers.utils.parseUnits('1000000', 'ether')
  )
  const submitTerms = useCallback(() => {

  },[])

  const getTerms = useCallback(() => {
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
  }
}

export const usePoolFactory = () => {
  const [pool,setPool] = useState({})
  const { address, isConnected } = useAccount()
  const { data:signer, isError, isLoading } = useSigner()
  const {
    name,
    lenders,
    maxWithdrawPerPeriod,
    withdrawPeriodLength,
    endDate,
    intervalInDays,
    aprInBps
  } = useProposal()

  const deployHDT = useCallback(async () => {
    if (!isError && !isLoading) {
      const TUP = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.TransparentUpgradeableProxy.abi),
        Static.TransparentUpgradeableProxy.bytecode,
        signer
      )
      const HDT = new ethers.ContractFactory(
        new ethers.utils.Interface(Static.HDT.abi),
        Static.HDT.bytecode,
        signer
      )
      const hdtImpl = await HDT.deploy()
      await hdtImpl.deployed()
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
      setPoolConfigAddr(poolConfig.addr)
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
    if (!isError && !isLoading && hdtAddr && poolConfigAddr) {
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
        withdrawPeriodLength,
        maxWithdrawPerPeriod,
        intervalInDays,
        aprInBps
      )
      await pool.deployed()
      return  pool 
    }
  }, [])

  const configurePool = useCallback(async(
  endDate, pool, poolConfig,hdt) => {
    if (!isError && !isLoading) {
      await poolConfig.setPool(pool.address)
      await hdt.setPool(pool.address)
      await poolConfig.setPoolLiquidityCap(
        ethers.utils.parseUnits(`${
          (
            (endDate - Math.floor(new Date().getTime() / 1000)) /
            withdrawPeriodLength
          ) * maxWithdrawPerPeriod
        }`, 'ethers')
      )
      await poolConfig.setPoolOwnerRewardsAndLiquidity(0,0)

      await poolConfig.setEvaluationAgent(0, Static.addresses.evaluationAgent)
      await poolConfig.setEARewardsAndLiquidity(0,0)
      await poolConfig.setPoolOwnerTreasury(Static.addresses.poolOwnerTreasury)
      await poolConfig.addPoolOperator(Static.addresses.poolOwner)
      await poolConfig.addPoolOperator(Static.addresses.poolOperator)
    }
  },[])

  const createPool = useCallback(async () => {
    const hdt  = await deployHDT()
    const poolConfig = await deployPoolConfig(hdt.address)
    const pool = await deployPool(poolConfig.address)
    await configurePool(endDate, pool, poolConfig, hdt)
    setPool(pool)
  },[])


    return {pool:pool}
}
