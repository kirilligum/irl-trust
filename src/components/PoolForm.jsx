import { useContext, useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'
import { Layout } from '../components/layout/Layout'
import {
  useProposal,
} from '../hooks/usePool'
export const PoolForm = ({ handlePoolContract }) => {
  const {
    name, setName,
    withdrawPeriodLength, setWithdrawPeriodLength,
    maxWithdrawPerPeriod, setMaxWithdrawPerPeriod,
    description, setDescription,
    repaymentStartDate, setRepaymentStartDate,
    repaymentEndDate, setRepaymentEndDate,
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
  const [poolAddress, setPoolAddress] = useState("")


  useEffect(() => {
    handlePoolContract(poolContract)
  }, [poolContract, handlePoolContract])

  useEffect(() => {
    console.log('useEffect', endDate)
  }, [endDate])


  return (
    <>
      <div className="flex flex-row justify-between">
        <div>
          <div className="flex justify-center  font-bold">Loan status</div>
          <div className="flex justify-center ">Create</div>
        </div>
        <div>
          <div className="flex justify-center  font-bold">Amount</div>
          <div className="flex justify-center ">0 USDC</div>
        </div>
        <div>
          <div className="flex justify-center  font-bold">Left to withdraw</div>
          <div className="flex justify-center ">0 USDC</div>
        </div>
        <div>
          <div className="flex justify-center  font-bold">Left to repay</div>
          <div className="flex justify-center ">0 USDC</div>
        </div>
      </div>
      <h1>Create Proposal</h1>
      Name:
      <input
        onChange={(event) => {
          setName(event.target.value)
        }}
        className='text-black' name="desc" type="text" defaultValue={name} />
      Description:
      <textarea
        onChange={(event) => {
          setDescription(event.target.value)
        }}
        className='text-black'
        name="desc"
        rows='4'
        defaultValue={"sewing maching to start a business"} />
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
      </div>
      <h3>Growth: withdrawls</h3>
      <h4>linear:</h4>
      <div className='flex-row'>
        amount per period(USDC):<br />
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
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+1000</button><br />
        <div className='flex-row'>
          Period Length: <br />
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
        Authorized Lenders:<br />
        {
          [...Array(lendersIter).keys()].map((i) => {
            return (<>
              <input
                onChange={(event) => {
                  setLenders(old => {
                    old[i] = event.target.value
                    return old
                  })
                }}
                key={i} style={{
                  marginBottom: '1px',
                  width: '390px'
                }} className='text-black' type="text" value={lenders[i]} /><br /></>)
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
          className="m-1 h-8 w-16 items-center justify-center rounded-md bg-blue-600 " >+</button>
      </div>
      <div className='flex flex-row items-center'>
        end date:<br />
        <input
          onChange={(event) => {
            console.log('event', event.target.value)
            setEndDate(event.target.value)
          }}
          className='w-32 h-6 mx-2 text-black' type="date" value={endDate} /> +
        <button
          onClick={() => {
            setEndDate(() => {
              var result = new Date(endDate)
              result.setDate(result.getDate() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button
          onClick={() => {
            setEndDate(() => {
              var result = new Date(endDate)
              result.setDate(result.getDate() + 7)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button
          onClick={() => {
            setEndDate(() => {
              var result = new Date(endDate)
              result.setMonth(result.getMonth() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
        <button
          onClick={() => {
            setEndDate(() => {
              var result = new Date(endDate)
              result.setFullYear(result.getFullYear() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div>
      <h3>Caring: repayments</h3>
      <div className='flex-row'>
        APR:<br />
        <input
          onChange={(event) => {
            setAprInBps(Number(event.target.value))
          }}
          className='w-16 text-black' type="float" value={aprInBps} /> % +
        <button
          onClick={() => { setAprInBps(() => aprInBps + 0.01) }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.01</button>
        <button
          onClick={() => { setAprInBps(() => aprInBps + 0.1) }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.10</button>
        <button
          onClick={() => { setAprInBps(() => aprInBps + 1) }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button> %
      </div>
      <div className='flex flex-row items-center'>
        start date:<br />
        <input
          onChange={(event) => {
            console.log('event', event.target.value)
            setRepaymentStartDate(event.target.value)
          }}
          className='w-32 h-6 mx-2 text-black' type="date"
          value={repaymentStartDate} /> +
        <button
          onClick={() => {
            setRepaymentStartDate(() => {
              var result = new Date(repaymentStartDate)
              result.setDate(result.getDate() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button
          onClick={() => {
            setRepaymentStartDate(() => {
              var result = new Date(repaymentStartDate)
              result.setDate(result.getDate() + 7)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button
          onClick={() => {
            setRepaymentStartDate(() => {
              var result = new Date(repaymentStartDate)
              result.setMonth(result.getMonth() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " > M</button >
        <button
          onClick={() => {
            setRepaymentStartDate(() => {
              var result = new Date(repaymentStartDate)
              result.setFullYear(result.getFullYear() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div >
      <div className='flex flex-row items-center'>
        end date:<br />
        <input
          onChange={(event) => {
            console.log('event', event.target.value)
            setRepaymentEndDate(event.target.value)
          }}
          className='w-32 h-6 mx-2 text-black' type="date" value={repaymentEndDate} /> +
        <button
          onClick={() => {
            setRepaymentEndDate(() => {
              var result = new Date(repaymentEndDate)
              result.setDate(result.getDate() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
        <button
          onClick={() => {
            setRepaymentEndDate(() => {
              var result = new Date(repaymentEndDate)
              result.setDate(result.getDate() + 7)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
        <button
          onClick={() => {
            setRepaymentEndDate(() => {
              var result = new Date(repaymentEndDate)
              result.setMonth(result.getMonth() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
        <button
          onClick={() => {
            setRepaymentEndDate(() => {
              var result = new Date(repaymentEndDate)
              result.setFullYear(result.getFullYear() + 1)
              return result.toISOString().split('T')[0]
            }
            )
          }}
          className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
      </div>
      <p>90 days to default</p>
      <button
        onClick={async () => {
          await submitTerms()
          // await createPool()
        }}
        className='p-2 bg-orange-600'>Initialize Pool
      </button>

      <br />

      <input style={{ color: 'blue' }} onChange={(event) => { setPoolAddress(event.target.value) }} />

      <button
        className='p-2 bg-orange-300'
        onClick={() => getTerms(poolAddress)
        }
      >
        Get Pool Terms Info
      </button>



    </>)
}
