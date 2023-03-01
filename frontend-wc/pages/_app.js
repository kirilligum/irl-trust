import '../styles/globals.css'
import {
    EthereumClient,
    modalConnectors,
    walletConnectProvider,
} from "@web3modal/ethereum";

import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";

const chains = [polygon];

const YOUR_PROJECT_ID = "5f37f72f86b701ddc31e91ef39dcc291"
// Wagmi client

const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: YOUR_PROJECT_ID }),
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({
        projectId: YOUR_PROJECT_ID,
        version: "1", // or "2"
        appName: "web3Modal",
        chains,
    }),
    provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);


export default function App({ Component, pageProps }) {
    return (
        <>
            <WagmiConfig client={wagmiClient}>
                <Component {...pageProps} />
            </WagmiConfig>

            <Web3Modal
                projectId={YOUR_PROJECT_ID}
                ethereumClient={ethereumClient}
            />
        </>
    )
}
