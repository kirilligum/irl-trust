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
  const [description, setDescription] = useState("Description")
  const [loanPaidTo, setLoanPaidTo] = useState("Recipient Address")

  const [withdrawPeriodLength, setWithdrawPeriodLength] = useState("day")
  const [maxWithdrawPerPeriod, setMaxWithdrawPerPeriod] = useState(0)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  console.log('endDate', endDate)
  const [lenders, setLenders] = useState([])
  const [intervalInDays, setIntervalInDays] = useState(12)
  const [aprInBps, setAprInBps] = useState(30)
  const [poolContract, setPoolContract] = useState(null)
  const { data: signer, isError, isLoading } = useSigner()
  const [repaymentStartDate, setRepaymentStartDate] = useState(new Date())
  const [repaymentEndDate, setRepaymentEndDate] = useState(new Date())

  const submitTerms = useCallback(async () => {
    let queryString = `
    mutation {
      createIrlTermsheet(input:{
        content:{
          PoolName: "${name}"
          PoolAddress: "${poolContract}"
          TermsDescription: "${description}"
          AmountPerPeriod: "${maxWithdrawPerPeriod}"
          WithdrawPeriodLength: "${withdrawPeriodLength}"
          AuthorizedLenders: " ${lenders.join(', ')}"
          LoanPaidTo: "${loanPaidTo}"
          LoanEndDate: "${endDate}"
          APR: "${aprInBps * 100}"
          RepaymentStartDate: "${repaymentStartDate}"
          RepaymentEndDate: "${repaymentEndDate}"
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
    console.log("querystring: ", queryString)

    const ts = await composeClient.executeQuery(queryString)
    console.log("ts: ", ts)
  }, [name, description, maxWithdrawPerPeriod, loanPaidTo, endDate, aprInBps, repaymentEndDate, repaymentEndDate, poolContract])


  const getTerms = useCallback(async (_poolAddress) => {
    console.log("PooolaAddress: ", _poolAddress)
    let queryString = `
    
    query MyQuery {
      irlTermsheetIndex(last: 50){
        edges{
          node{
            PoolName
            PoolAddress
            TermsDescription
            AmountPerPeriod
            WithdrawPeriodLength
            AuthorizedLenders
            LoanPaidTo
            LoanEndDate
            APR
            RepaymentStartDate
            RepaymentEndDate
            DefaultDays
            URL
          } 
        }
      }  
    }
    `
    // console.log(queryString)

    let results = await composeClient.executeQuery(queryString)
    results = results.data.irlTermsheetIndex.edges
    let match = results.filter(item => { return item.node.PoolAddress === _poolAddress })
    match = match[0].node
    console.log("results:", match)

    return match

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
        Math.floor(new Date(endDate).getTime() / 1000),
        intervalInDays,
        aprInBps
      )
      await pool.deployed()
      console.log('pool deployed', pool)
      return {pool, poolProxy} 
    }
  }, [])

  const configurePool = useCallback(async (
    endDate, pool, poolConfig, hdt) => {
    if (!isError && !isLoading) {
      await poolConfig.setPool(pool.address)
      await hdt.setPool(pool.address)
      console.log('liquidity cap')
      const endTime = Math.floor(new Date(endDate).getTime() / 1000)
      const startTime = Math.floor(new Date().getTime() / 1000)
      const duration = endTime - startTime
      const periods = duration / mapPeriod(withdrawPeriodLength)
      const liquidityCap = periods * maxWithdrawPerPeriod
      console.log(liquidityCap)
      console.log(endTime, startTime, duration, periods)
      console.log(ethers.utils.parseUnits(String(liquidityCap), 'ether'))
      await poolConfig.setPoolLiquidityCap(
        ethers.utils.parseUnits(String(liquidityCap), 'ether')
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
      await poolConfig.setWithdrawalLockoutPeriod(90)
      await poolConfig.setPoolDefaultGracePeriod(60)
    }
  }, [endDate, maxWithdrawPerPeriod, withdrawPeriodLength])

  const enablePool = useCallback(async (poolAddr) => {
    if (!isError && !isLoading) {
      const poolStarter = new ethers.Contract(
        Static.PoolStarter.address,
        Static.PoolStarter.abi,
        signer
      )
      const res = await poolStarter.enablePool(poolAddr)
    }
  }, [poolContract])
  const createPool = useCallback(async (
  ) => {
    console.log('enddate', endDate)
    console.log('max', maxWithdrawPerPeriod)
    console.log('deploying hdt')
    const hdt = await deployHDT()
    console.log('deploying poolconfig')
    const poolConfig = await deployPoolConfig(hdt.address)
    console.log('deploying pool')
    const {pool, poolProxy} = await deployPool(poolConfig.address)
    console.log('configuring pool')
    await configurePool(endDate, pool, poolConfig, hdt)
    await enablePool(pool.address)
    setPoolContract(pool)
    localStorage.setItem("pool", JSON.stringify({pool: pool.address, poolProxy:poolProxy.address}))
    
  }, [endDate, lenders, maxWithdrawPerPeriod, withdrawPeriodLength, lenders])


  useEffect(() => {
    if (isConnected) {
      setBorrower(address)
    }
  }, [isConnected])
  return {
    name: name,
    setName: setName,
    withdrawPeriodLength: withdrawPeriodLength,
    setWithdrawPeriodLength: setWithdrawPeriodLength,
    maxWithdrawPerPeriod: maxWithdrawPerPeriod,
    setMaxWithdrawPerPeriod: setMaxWithdrawPerPeriod,
    endDate: endDate,
    setEndDate: setEndDate,
    lenders: lenders,
    setLenders: setLenders,
    intervalInDays: intervalInDays,
    setIntervalInDays: setIntervalInDays,
    aprInBps: aprInBps,
    setAprInBps: setAprInBps,
    submitTerms: submitTerms,
    getTerms: getTerms,
    createPool: createPool,
    poolContract: poolContract,
    repaymentEndDate: repaymentEndDate,
    setRepaymentEndDate: setRepaymentEndDate,
    loanPaidTo: loanPaidTo,
    setLoanPaidTo: setLoanPaidTo,
    description: description,
    setDescription: setDescription
  }
}

export const usePool = (pool) => {
  const { address, isConnected } = useAccount()
  const { data:signer, isError, isLoading } = useSigner()
  const [amount, setAmount] = useState(0)
  const [poolAmount, setPoolAmount] = useState(0)

  const withdraw = useCallback(async () => {
    if (!isLoading && !isError) {
      const poolContract = new ethers.Contract(
        pool,
        Static.BaseCreditPool.abi,
        signer
      )
      console.log(poolAmount)
      console.log(Number(ethers.utils.parseUnits(String(1), 0)))
      const res = await poolContract.withdraw(
        ethers.utils.parseUnits(String(1),1)
      )
    }
  }, [isLoading, isError, pool, poolAmount])
  const getPoolAmount = useCallback(async () => {
    if (!isLoading && !isError) {
      const tokenContract = new ethers.Contract(
        Static.TestToken.address,
        Static.TestToken.abi,
        signer
      )
      const res = await tokenContract.balanceOf(pool)
      setPoolAmount(ethers.utils.formatUnits(res, 6))
    }
  })
  const approve = useCallback(async () => {
    if (!isLoading && !isError) {
      const tokenContract = new ethers.Contract(
        Static.TestToken.address,
        Static.TestToken.abi,
        signer
      )
      console.log(amount, pool)
      const res = await tokenContract.approve(
        pool,
        ethers.utils.parseUnits(String(amount), '6')
      )
      console.log(res)
    }
  }, [isLoading, isError, poolAmount, pool])

  const deposit = useCallback(async() => {
    if (!isLoading && !isError) {
      const poolContract = new ethers.Contract(
        pool,
        Static.BaseCreditPool.abi,
        signer
      )
      console.log(poolContract)
      const res = await poolContract.deposit(
        ethers.utils.parseUnits(String(amount), '6')
      )
      console.log('res', res)
    }
  }, [isLoading, isError, signer, amount])


  useEffect(() => {

  }, [isLoading, isError])

  return {
    deposit: deposit,
    approve: approve,
    amount: amount,
    setAmount: setAmount,
    poolAmount: poolAmount,
    getPoolAmount: getPoolAmount,
    withdraw: withdraw
  }
}
