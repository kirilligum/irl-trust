import { NextPage } from 'next'
// import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
// import { TxnList } from '../components/TxnList'
// import XmtpContext from '../context/xmtp'
// import { tw } from 'twind'

import { useCeramicContext } from '../composedb/context';



const Borrow: NextPage = () => {
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

  //ceramic stuff
  const clients = useCeramicContext()
  const { ceramic, composeClient } = clients

  const createTermsheet = async () => {
    console.log("writing termsheet....")

    const ts = await composeClient.executeQuery(`
    mutation {
      createTermSheet(input:{
        content:{
          TermsDescription: "Car financing"
          AmountUSDC: "1000"
          LoanPaidOutTo: "xyzCars.eth"
          LoanStartDate: "2023-03-20"
          LoanEndDate: "2023-09-20"
          APR: "6.23"
          RepaymentStartDate: "2023-04-20"
          RepaymentEndDate: "2023-12-20"
          DefaultDays: 90
          URL: "https://irltrust.xyz/djc8s"
        }
      })
      {
        document{
          id
          TermsDescription
        }
      }
    }
    `)

    console.log(ts)
  }

  return (
    <Layout>
      <>
        Loan status: Create,
        amount: 0,
        left to withdraw: 0,
        left to repay: 0,
        <h1>Create Proposal</h1>
        name: <input className='w-64 text-black' name="desc" type="text" defaultValue={"sewing maching "} />
        desc: <input className='w-128 text-black' name="desc" type="text" defaultValue={"sewing maching to start a business"} />
        <h2>Terms</h2>
        {/* <div className='flex-row'> */}
        {/*   <button className='triangle-in'>withdraw</button> */}
        {/*   <div className='triangle-out'>repay</div> */}
        {/* </div> */}
        <h3>Growth: withdrawls</h3>
        <h4>linear:</h4>
        <div className='flex-row'>
          amount (USDC): <input className='w-32 text-black' type="float" value={0} />+
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >10</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >100</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1000</button>
          pay to: <input className='w-32 text-black' type="text" value={"organicseeds.eth"} />
        </div>
        <div className='flex-row'>
          start date: <input className='w-32 text-black' type="date" value={todayDate} /> +
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <div className='flex-row'>
          end date: <input className='w-32 text-black' type="date" value={todayDate} />+
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <h3>Caring: repayments</h3>
        <div className='flex-row'>
          APR: <input className='w-32 text-black' type="float" value={15} />% +
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.01</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >.10</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button>
        </div>
        <div className='flex-row'>
          start date: <input className='w-32 text-black' type="date" value={todayDate} /> +
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <div className='flex-row'>
          end date: <input className='w-32 text-black' type="date" value={todayDate} />+
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Day</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >W</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >M</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >Y</button>
        </div>
        <p>90 days to default</p>

        <button onClick={() => { createTermsheet() }}

          className='p-2 bg-orange-600'>send to lenders</button>
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
