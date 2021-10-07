import type { AppProps } from 'next/app'
import { Provider } from "next-auth/client"
import { ChakraProvider } from "@chakra-ui/react"
import Nav from '../lib/components/nav'
import { Container } from "@chakra-ui/react"

import '../styles/globals.scss'
import Layout from '../lib/components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <ChakraProvider>
        <Nav />
        <Container minH="100vh">
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Container>
      </ChakraProvider>
    </Provider>
  )
}
export default MyApp
