import { useEffect, useState } from 'react';
import { Layout } from '../../components/layout/Layout'
// import { Borrow } from '../components/Borrow'
// import { Lend } from '../components/Lend'
import { Head } from '../../components/layout/Head'
import Link, { LinkProps } from 'next/link'



import { useAccount, useProvider, useSigner, useBalance } from "wagmi";

function Page() {


  //wallet status
  const provider = useProvider()
  const { data: signer, isError, isLoading } = useSigner()
  const { address, isConnected } = useAccount()
  useEffect(() => {
    console.log("connection status...", isConnected)
    console.log("Addresss: ", address)
  }, [isConnected]);



  return (
    <Layout>
      <Head />
      <div className="flex flex-col">
        <h1>lens</h1>
        <div>username: jiji</div>
        <div>sortest path: me → Bill → Lydia → juju</div>
        <div>score: 82.5</div>
        <h1>ongoing loans</h1>
        <table>
          <tr>
            <td> name </td>
            <td> status </td>
            <td> lender </td>
            <td> borrower </td>
          </tr>
          <tr>
            <td> sewing maching </td>
            <td> proposal </td>
            <td>
              <Link
                className='underline'
                href="/users/juju" as="/users/juju">juju</Link>
            </td>
            <td> jiji </td>
          </tr>
        </table>
        <h1>history</h1>
        {/* <Borrow /> */}
        {/* <Lend /> */}
        <div className="p-4"></div>

        {/* <button onClick={() => createTermsheet()}>create termsheet</button> */}

      </div>
    </Layout>
  )
}

export default Page
