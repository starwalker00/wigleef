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
                // height='100vh'
                display='flex'
                flexDirection='column'
                alignItems='center'
                pt={12}
                pb={{
                    base: 24, md: 12
                }}
            // width={{ base: "100%", sm: "20em", md: "50em" }}
            >
                {children}
            </Container>
        </>
    )
}

export default PageContainer
