import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import {
  useProposal,
} from '../hooks/usePool'
export const PoolForm = ({handlePoolContract}) => {
  const {
    name, setName,
    withdrawPeriodLength, setWithdrawPeriodLength,
    maxWithdrawPerPeriod, setMaxWithdrawPerPeriod,
    description, setDescription,
    RepaymentStartDate, setRepaymentStartDate,
    RepaymentEndDate, setRepaymentEndDate,
    endDate, setEndDate,
    lenders, setLenders,
    intervalInDays, setIntervalInDays,
    aprInBps, setAprInBps,
    getTerms,
    createPool,
    submitTerms,
    poolContract
  } = useProposal()
  const [lendersIter, setLendersIter] = useState(1)

  useEffect(() => {
    handlePoolContract(poolContract)
  },[poolContract, handlePoolContract])

  useEffect(() => {
    console.log('useEffect', endDate)
  }, [endDate])

  return (
    <>
      Loan status: Create,
      amount: 0,
      left to withdraw: 0,
      left to repay: 0,
      <h1>Create Proposal</h1>
      name:
      <input
        onChange={(event) => {
          setName(event.target.value)
        }}
        className='w-64 text-black' name="desc" type="text" defaultValue={name} />
      desc:
      <input
        onChange={(event) => {
          setDescription(event.target.value)
        }}
        className='w-128 text-black' name="desc" type="text" defaultValue={"sewing maching to start a business"} />
      <h2>Terms</h2>
      <div className='flex-row gap-1 flex'>
        <div className='relative'>
          <div className='triangle-in'>
          </div>
          <div className='absolute bottom-2 right-1'>
            withdraw
          </div>
        </div>
        <div className='relative'>
          <div className='square'>
          </div>
          <div className='absolute bottom-4 '
            style={{ left: "50%", transform: "translate(-50%,0)" }}
          >
            pause
          </div>
        </div>
        <div className='relative'>
          <div className='triangle-out'>
          </div>
          <div className='absolute bottom-2 left-1'>
            repay
          </div>
        </div>
        {/* <span className='relative'> */}
        {/*   <button className='square absolute'> */}
        {/*   </button> */}
        {/*   <div className=''> */}
        {/*     wait */}
        {/*   </div> */}
        {/* </span> */}
        {/* <span className='relative flex-col'> */}
        {/*   <button className='triangle-out absolute'> */}
        {/*   </button> */}
        {/*   <div className=''> */}
        {/*     repay */}
        {/*   </div> */}
        {/* </span> */}
      </div>
      <h3>Growth: withdrawls</h3>
      <h4>linear:</h4>
      <div className='flex-row'>
        amount per period(USDC):<br/>
        <input
          onChange={(event) => {
            setMaxWithdrawPerPeriod(Number(event.target.value))
          }}
          className='w-32 text-black' type="float" value={maxWithdrawPerPeriod} />
        <button
          onClick={() => {
            setMaxWithdrawPerPeriod(
              old => old + 1
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+1</button>
        <button
          onClick={() => {
            setMaxWithdrawPerPeriod(
              old => old + 10
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+10</button>
        <button
          onClick={() => {
            setMaxWithdrawPerPeriod(
              old => old + 100
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+100</button>
        <button
          onClick={() => {
            setMaxWithdrawPerPeriod(
              old => old + 1000
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+1000</button><br/>
        <div className='flex-row'>
          Period Length: <br/>
          <input
            className='w-32 text-black' type="text" value={withdrawPeriodLength} />
          <button
            onClick={() => {
              setWithdrawPeriodLength('day')
            }}
            className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button
            onClick={() => {
              setWithdrawPeriodLength('week')
            }}
            className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button
            onClick={() => {
              setWithdrawPeriodLength('month')
            }}
            className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button
            onClick={() => {
              setWithdrawPeriodLength('year')
            }}
            className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        Authorized Lenders:<br/>
        {
          [...Array(lendersIter).keys()].map((i) => {
            return (<>
              <input
                onChange={(event) => {setLenders(old => {
                  old[i] = event.target.value
                  return old
                } )}}
                key={i} style={{
                  marginBottom: '1px',
                  width: '390px'
                }} className='text-black' type="text" value={lenders[i]} /><br/></>)
          })
        }
        <button
          onClick={() => {
            setLendersIter(old => {
              old++
              return old
            })
            console.log(lendersIter)
          }
          }
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+</button>
      </div>
      <div className='flex-row'>
        end date:<br/>
        <input
          onChange={(event) => {
            console.log('event', event.target.value)
            setEndDate(event.target.value)
          }}
          className='w-32 text-black' type="date" value={endDate} />
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div>
      <h3>Caring: repayments</h3>
      <div className='flex-row'>
        APR:<br/>
        <input
          onChange={(event) => {
            setAprInBps(Number(event.target.value))
          }}
          className='w-32 text-black' type="float" value={aprInBps} />% +
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.01</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.10</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button>
      </div>
      <div className='flex-row'>
        start date: <input className='w-32 text-black' type="date" value={
        new Date().toISOString().split('T')[0]
        } /> +
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div>
      <div className='flex-row'>
        end date: <input className='w-32 text-black' type="date" value={
        new Date().toISOString().split('T')[0]
        } />+
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
        <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div>
      <p>90 days to default</p>
      <button
        onClick={async () => {
          await submitTerms()
          await createPool()
        }}
        className='p-2 bg-orange-600'>Initialize Pool</button>
    </>)
}
