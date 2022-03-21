import '../styles/global.css'
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apolloClient";

import { ChakraProvider } from '@chakra-ui/react'

import { Provider as WagmiProvider, chain, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { AppProvider } from '../components/context/AppContext';
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

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
    <AppProvider>
      <ApolloProvider client={apolloClient}>
        <WagmiProvider /*autoConnect*/ connectors={connectors}>
          <ChakraProvider>
            {getLayout(<Component {...pageProps} />)}
          </ChakraProvider>
        </WagmiProvider>
      </ApolloProvider>
    </AppProvider>
  )
}

export default MyApp
