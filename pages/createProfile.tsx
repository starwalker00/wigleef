import {
    Stack,
    Container,
    Heading
} from '@chakra-ui/react';
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import CreateProfileForm from '../components/CreateProfileForm';

function Post() {
    return (
        <Container border='2px solid blue'>
            <Stack direction='column'>
                <Heading alignSelf={'center'}>Create a profile</Heading>
            </Stack>
            <Stack
                border='2px solid green'
                direction='column'
            // justifyContent='space-around'
            // alignItems='stretch'
            >
                <CreateProfileForm />
            </Stack>
        </Container>
    )
}

Post.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar>
                {page}
            </Sidebar>
        </Layout>
    )
}

export default Post
