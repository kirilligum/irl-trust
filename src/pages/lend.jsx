import { NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
// import { TxnList } from '../components/TxnList'
// import XmtpContext from '../context/xmtp'
// import { tw } from 'twind'

import { usePool } from '../hooks/usePool'
const Lend = () => {
  const [pool, setPool] = useState(JSON.parse(localStorage.getItem("pool")).pool)
  const {
    deposit,
    amount,
    approve,
    setAmount
  } = usePool(pool)

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
        days late:0.
        <h1>profile</h1>
        Score: 75
        <h1>Proposal</h1>
        <h2>description</h2>
        text
        <h2>terms</h2>
        table
        <h1>enter the pool</h1>
        <button 
          className='p-2 bg-orange-600'>Request Entry into Pool</button>
        <h2>share</h2>
        <div>URL: irl-trust.xyz/{pool}
          <button className='p-2 bg-blue-600'>copy link</button>
        </div>
        <h1>commit funds to the pool</h1>
        <div className='flex-row'>
          contribute amount (USDC):
          <input onChange={(event) => {
            setAmount(event.target.value)
          }} className='w-32 text-black' type="float" value={amount} />+
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >10</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >100</button>
          <button className="m-1 h-12 w-12 items-center justify-center rounded-full bg-blue-600 " >1000</button>
        </div>
        <button
          onClick={async () => {
            await approve()
            await deposit()
          }}
          className='p-2 bg-orange-600'>send funds</button>
        <div className='flex-row'>
          <button className='p-2 bg-green-600'>jubilee</button>
          % forgiven: 0
        </div>
      </>
    </Layout >
  )
}

export default Lend
