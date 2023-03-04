import { useState, useCallback, useEffect } from 'react'
import {ethers} from 'ethers'
import { useAccount, useContract } from 'wagmi'
import Static from '../public/Static.json'
export const useProposal = () => {
  const {account, isConnected} = useAccount()
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

  useEffect(() => {
    setBorrower(account)
  }, [isConnected])

  return {
    setName,
    setWithdrawPeriodLength,
    setMaxWithdrawPerPeriod,
    setEndDate,
    setLenders,
    setIntervalInDays,
    setAprInBps,
    submitTerms
  }
}

export const usePoolFactory = () => {
  const { address, isConnected } = useAccount()

  return {}
}
