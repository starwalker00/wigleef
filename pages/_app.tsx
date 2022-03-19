import '../styles/global.css'
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apolloClient";

import { ChakraProvider } from '@chakra-ui/react'

import { Provider as WagmiProvider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

// const infuraId = 'Pld6XQBC-Jcd2Ls10sPWEG2IsgjCsO4N';
const chains = defaultChains;
type Connector = InjectedConnector;
// Set up connectors
const connectors = ({ chainId }: { chainId?: number }): Connector[] => {
  const rpcUrl =
    chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
    chain.mainnet.rpcUrls[0];
  return [
    new InjectedConnector({ chains }),
  ];
};

function MyApp({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <ApolloProvider client={apolloClient}>
      <WagmiProvider /*autoConnect*/ connectors={connectors}>
        <ChakraProvider>
          {getLayout(<Component {...pageProps} />)}
        </ChakraProvider>
      </WagmiProvider>
    </ApolloProvider>
  )
}

export default MyApp
