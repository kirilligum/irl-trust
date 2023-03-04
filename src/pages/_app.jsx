import { EthereumClient } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import NextHead from 'next/head'
import * as React from 'react'
import { WagmiConfig } from 'wagmi'
import '../styles/globals.css'

import { chains, client, walletConnectProjectId } from '../wagmi'

//ceramic stuff
import { CeramicWrapper } from "../composedb/context";
import { useCeramicContext } from '../composedb/context';
import { authenticateCeramic } from '../composedb/utils'

const ethereumClient = new EthereumClient(client, chains)

function App({ Component, pageProps }) {

  //ceramic stuff
  const clients = useCeramicContext()
  const { ceramic, composeClient } = clients
  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient)
    // await getProfile()
    console.log("ceramic")
    console.log(ceramic.did)
  }

  React.useEffect(() => {
    handleLogin()
  }, [])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>IRL-Trust</title>
      </NextHead>

      {mounted && <Component {...pageProps} />}

      <Web3Modal
        projectId={walletConnectProjectId}
        ethereumClient={ethereumClient}
      />
    </WagmiConfig>
  )
}

export default App
