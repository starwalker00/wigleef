import Head from 'next/head'
import { Container } from '@chakra-ui/react'
import NewPostButton from '../components/NewPostButton'

function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Wigleef</title>
            </Head>
            <Container
                width='100%'
                maxWidth='100%'
                m='0'
                p='0'
                // bgColor={{ base: 'blue', md: 'red', lg: 'green' }}
                display='flex'
                flexDirection={{ base: 'column', md: 'row' }}
            // style={{ border: '3px solid red' }}
            >
                {children}
            </Container>
            <NewPostButton />
        </>
    )
}

export default Layout
