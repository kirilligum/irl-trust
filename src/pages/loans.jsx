import { NextPage } from 'next'
// import { useContext, useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
// import { TxnList } from '../components/TxnList'
// import XmtpContext from '../context/xmtp'
// import { tw } from 'twind'


const Loans = () => {
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
        <h1>Loans</h1>
        <h1>Requests to join</h1>
        <table>
          <tr>
            <td>score</td>
            <td>name</td>
            <td>link</td>
            <td>total amount</td>
            <td>Token</td>
            <td>APR</td>
            <td>message </td>
            <td>amount</td>
            <td>action</td>
          </tr>
          <tr>
            <td>82.5</td>
            <td>sewing</td>
            <td>link.xyz</td>
            <td>$20</td>
            <td>USDC</td>
            <td>%3</td>
            <td>
              <input className='w-32 text-black' name="desc" type="text" defaultValue={"it's your uncle's friend."} />
            </td>
            <td>
              <input className='w-8 text-black' name="amount" type="float" defaultValue={"0"} />
            </td>
            <td><button className='p-2 rounded-xl bg-green-600'>request</button></td>
          </tr>
          <tr>
            <td>75</td>
            <td>scooter</td>
            <td>link2.xyz</td>
            <td>$200</td>
            <td>USDC</td>
            <td>%4</td>
            <td>
            </td>
            <td>
              <input className='w-8 text-black' name="amount" type="float" defaultValue={"0"} />
            </td>
            <td><button className='p-2 rounded-xl bg-yellow-600'>fund</button></td>
          </tr>
        </table>
      </>
    </Layout >
  )
}

export default Loans
