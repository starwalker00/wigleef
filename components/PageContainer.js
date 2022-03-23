import { Container } from '@chakra-ui/react'

// responsively style pages listing publications
function PageContainer({ children }) {

    return (
        <>
            <Container as='section'
                maxWidth={{ base: '100%', md: '80% ' }}
                m='0'
                px={{
                    base: '2', md: '20'
                }}
                py='10'
                display='flex'
                flexDirection='column'
                alignItems='center'
            >
                {children}
            </Container>
        </>
    )
}

export default PageContainer
