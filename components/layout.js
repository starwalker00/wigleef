import Head from 'next/head'
import styles from './layout.module.css'
import { Container } from '@chakra-ui/react'

function Layout({ children }) {

    return (
        <>
            <Head>
                <title>Layouts Example</title>
            </Head>
            <Container
                width='100%'
                maxWidth='100%'
                m='0'
                p='0'
                // bgColor={{ base: 'blue', md: 'red', lg: 'green' }}
                display={{ base: 'inherit', md: 'flex' }}>
                {children}
            </Container>
        </>
    )
}

export default Layout
