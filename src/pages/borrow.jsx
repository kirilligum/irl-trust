import { NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { PoolForm } from '../components/PoolForm'
// import { TxnList } from '../components/TxnList'
// import XmtpContext from '../context/xmtp'
// import { tw } from 'twind'
import {
  useProposal,
} from '../hooks/usePool'




const Borrow = () => {
  const [lendersIter, setLendersIter] = useState(1)
  const [pool, setPool] = useState(null)
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

  const handlePoolContract = (pc) => {
    console.log(pc)
    setPool(pc)
  }

  return (
    <Layout>
      <PoolForm
        handlePoolContract={handlePoolContract}
      />
        {pool && (<><div>URL: irl-trust.xyz/{poolContract.address}
          <button className='p-2 bg-blue-600'>copy link</button>
        </div>

        <h1>Lender Status</h1>
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
        </>)}
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
    </Layout >
  )
}

export default Borrow
