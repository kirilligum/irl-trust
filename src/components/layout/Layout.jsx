// import { Link } from '@chakra-ui/react'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
// import NextLink from 'next/link'
import ActiveLink from './ActiveLink'
import React from 'react'
import { Head, MetaProps } from './Head'
import { Account } from '..'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import irltLogo from '../../public/irl-trust-logo.jpg'

// import { useCheckOwnership } from '../../hooks/useCheckOwnership'
// import { CheckBadgeIcon, CheckCircleIcon, HomeIcon, InboxIcon, PaperAirplaneIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid'


export const Layout = ({ children, customMeta }) => {
  const { address } = useAccount()
  const { isConnected } = useAccount()
  // const connectedOwnsNFT = useCheckOwnership(address)

  // //@ts-ignore
  // const is_auditor = (String(address) == AUDITOR_ETH_ADDRESS)

  // let [toggle_a, toggleA] = React.useState(true)
  // let [toggle_b, toggleB] = React.useState(true)
  // // let [toggle_c, toggleC] = React.useState(connectedOwnsNFT)


  // const verifiedBadge = (label: string, verified: boolean, toggleVerified: any) => {
  //   if (!verified) {
  //     return <div onClick={toggleVerified.bind(null, !verified)} className='rounded-md bg-red-500 text-white self-center w-fit mr-3 p-1 px-3 flex flex-row items-center'><ShieldExclamationIcon className='w-12 p-2' /><strong className='pr-4'>{label}</strong></div>
  //   } else {
  //     return <div onClick={toggleVerified.bind(null, !verified)} className='rounded-md bg-green-500 text-black self-center w-fit mr-3 p-1 px-3 flex flex-row items-center content-center'><CheckCircleIcon className='w-12 p-2' /><strong className='pr-4'>{label}</strong></div>
  //   }
  // }

  return (
    <div className="bg-slate-900 w-full min-h-screen overflow-y-scroll text-white min-h-screen p-4 w-full items-center flex flex-col content-center min-h-screen">
      <Head customMeta={customMeta} />


      <div className="w-full container flex flex-col items-stretch" style={{ width: '40em' }}>
        <div className="flex flex-row ">
          <Image
            alt="Vercel logo"
            src={irltLogo}
            width={100}
            height={100}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          <h1 className="text-left py-4 text-6xl font-bold header mx-7 w-full pb-4">
            IRL-Trust
          </h1>
        </div>
        <div className="flex flex-row p-5 justify-between items-center">
          {isConnected && <Account />}
          <Web3Button />
        </div>
        <div className='flex flex-row items-center content-center justify-center mb-6 '>
          <div className="cursor-pointer bg-blue-500 text-blue-300 self-center rounded-lg font-bold w-fit flex flex-row content-center h-12 overflow-hidden">
            <ActiveLink activeClassName="bg-blue-600 text-white" href="/" passHref>
              <div className="hover:text-white px-4 hover:bg-blue-600 flex flex-row items-center"><strong>Dashboard</strong></div>
            </ActiveLink>

            <ActiveLink activeClassName="text-white bg-blue-600 " href="/borrow" passHref>
              <div className="hover:text-white px-4 hover:bg-blue-600 flex flex-row items-center"><strong>borrow</strong></div>
            </ActiveLink>
            <ActiveLink activeClassName="text-white bg-blue-600 " href="/lend" passHref>
              <div className="hover:text-white px-4 hover:bg-blue-600 flex flex-row items-center"><strong>lend</strong></div>
            </ActiveLink>
            <ActiveLink activeClassName="text-white bg-blue-600 " href="/loans" passHref>
              <div className="hover:text-white px-4 hover:bg-blue-600 flex flex-row items-center"><strong>loans</strong></div>
            </ActiveLink>
          </div>
        </div>
        {children}
      </div>


    </div>
  )
}
