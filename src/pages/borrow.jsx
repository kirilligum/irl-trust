import { NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
// import { TxnList } from '../components/TxnList'
// import XmtpContext from '../context/xmtp'
// import { tw } from 'twind'
import {
  useProposal,
} from '../hooks/usePool'




const Borrow = () => {
  const {
    name, setName,
    description, setDescription,
    loanPaidTo, setLoanPaidTo,
    withdrawPeriodLength, setWithdrawPeriodLength,
    maxWithdrawPerPeriod, setMaxWithdrawPerPeriod,
    endDate, setEndDate,
    RepaymentStartDate, setRepaymentStartDate,
    RepaymentEndDate, setRepaymentEndDate,
    lenders, setLenders,
    intervalInDays, setIntervalInDays,
    aprInBps, setAprInBps,
    submitTerms,
    getTerms,
    createPool
  } = useProposal()
  const [lendersIter, setLendersIter] = useState(1)
  // const { initClient, client } = useContext(XmtpContext)
  // let [xmtp_connected, setXMTPConnected] = useState(false)

  // useEffect(() => {
  //   console.log('init client')
  //   initClient()
  // }, [])

  // useEffect(() => {
  //   if (client) {
  //     setXMTPConnected(true)
  //   }
  // }, [client])

  var curr = new Date();
  curr.setDate(curr.getDate() + 3);
  var todayDate = curr.toISOString().substring(0, 10);



  return (
    <Layout>
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
          amount per period(USDC):<br />
          <input
            onChange={(event) => {
              setMaxWithdrawPerPeriod(Number(event.target.value))
            }}
            className='w-32 text-black' type="float" defaultValue={maxWithdrawPerPeriod} />
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
              className='w-32 text-black' type="text" defaultValue={withdrawPeriodLength}
              onChange={(event) => { setWithdrawPeriodLength(event.target.value) }}
            />
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
            className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >+</button>
        </div>
        <div className='flex-row'>
          end date:<br />
          <input
            onChange={(event) => setEndDate(new Date(event.target.value))}
            className='w-32 text-black' type="date" defaultValue={endDate.toISOString().split('T')[0]} />
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <h3>Caring: repayments</h3>
        <div className='flex-row'>
          APR:<br />
          <input
            onChange={(event) => {
              setAprInBps(Number(event.target.value))
            }}
            className='w-32 text-black' type="float" defaultValue={aprInBps} />% +
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.01</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.10</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button>
        </div>
        <div className='flex-row'>
          start date: <input className='w-32 text-black' type="date" defaultValue={todayDate}
            onChange={(event) => { setRepaymentStartDate(new Date(event.target.value)) }}
          /> +
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <div className='flex-row'>
          end date: <input className='w-32 text-black' type="date" defaultValue={todayDate}
            onChange={(event) => { setRepaymentEndDate(new Date(event.target.value)) }}
          />+
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <p>90 days to default</p>
        <button
          onClick={async () => {
            // await createPool()
            submitTerms()
          }}
          className='p-2 bg-orange-600'>Initialize Pool</button>
        <div>URL: irl-trust.xyz/alsdkfja
          <button className='p-2 bg-blue-600'>copy link</button>
        </div>

        <h1>Requests to join</h1>
        <table>
          <tr>
            <td>address</td>
            <td>message</td>
            <td>amount</td>
            <td>Token</td>
            <td>pool %</td>
            <td>approval</td>
          </tr>
          <tr>
            <td>0xbe23..f34</td>
            <td>this is your uncle, happy to help with starting your sewing business</td>
            <td>12</td>
            <td>USDC</td>
            <td>%60</td>
            <td><button className='p-2 rounded-xl bg-green-600'>approve</button></td>
          </tr>
          <tr>
            <td>0x12af..d78</td>
            <td>this is a friend of your uncle</td>
            <td>8</td>
            <td>USDC</td>
            <td>%40</td>
            <td><button className='p-2 rounded-xl bg-green-600'>approve</button></td>
          </tr>
        </table>
        total approvals: 0, total amount commited: 0
        <h1>withdrawls</h1>
        <table>
          <tr>
            <td>date</td>
            <td>countdown</td>
            <td>amount</td>
            <td>Token</td>
            <td>% left</td>
            <td>action</td>
          </tr>
          <tr>
            <td>03/04/2023</td>
            <td>2</td>
            <td>10</td>
            <td>USDC</td>
            <td>%50</td>
            <td><button className='p-2 rounded-xl bg-green-600'>withdraw</button></td>
          </tr>
          <tr>
            <td>03/11/2023</td>
            <td>9</td>
            <td>10</td>
            <td>USDC</td>
            <td>%0</td>
            <td><button className='p-2 rounded-xl bg-green-600'>withdraw</button></td>
          </tr>
        </table>
        <h1>payments</h1>
        <table>
          <tr>
            <td>date</td>
            <td>countdown</td>
            <td>amount</td>
            <td>Token</td>
            <td>% left</td>
            <td>action</td>
          </tr>
          <tr>
            <td>04/01/2023</td>
            <td>28</td>
            <td>11</td>
            <td>USDC</td>
            <td>%50</td>
            <td><button className='p-2 rounded-xl bg-green-600'>pay</button></td>
          </tr>
          <tr>
            <td>04/08/2023</td>
            <td>35</td>
            <td>11</td>
            <td>USDC</td>
            <td>%100</td>
            <td><button className='p-2 rounded-xl bg-green-600'>pay</button></td>
          </tr>
        </table>
        {/* {(xmtp_connected && ( */}
        {/*   <div className=""> */}
        {/*     <TxnList /> */}
        {/*   </div> */}
        {/* )) || ( */}
        {/*   <button */}
        {/*     onClick={initClient} */}
        {/*     className="rounded-xl bg-blue-500 px-4 p-2 font-black m-4" */}
        {/*   > */}
        {/*     load transaction history */}
        {/*   </button> */}
        {/* )} */}
      </>
    </Layout >
  )
}

export default Borrow
