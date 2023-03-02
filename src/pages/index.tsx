import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'

import { Account } from '../components'
import { Layout } from '../components/layout/Layout'
// import { Borrower } from '../components/Borrower'
// import { Lender } from '../components/Lender'
import { Head } from '../components/layout/Head'

function Page() {
  const { isConnected } = useAccount()

  return (
    <Layout>
      <Head />
      <h1>wagmi + Web3Modal + Next.js</h1>

      <h1 className="font-bold underline">
        Hello world!
      </h1>


      <Web3Button />

      {isConnected && <Account />}
      <div className="flex flex-col">
        {/* <Borrower /> */}
        {/* <Lender /> */}
        <div className="p-4"></div>
      </div>
    </Layout>
  )
}

export default Page
