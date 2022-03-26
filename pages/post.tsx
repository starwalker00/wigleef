import {
    Stack,
    Container,
    Heading
} from '@chakra-ui/react';
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostForm from '../components/PostForm';

function Post() {
    return (
        <Container margin='auto'
            // border='2px solid blue'
            borderTop='1px solid #3fada8'
            boxShadow={'lg'}
            rounded={'md'}
            p={3}
            pb={0}
        >
            <Stack direction='column' p={5} pb={0}>
                <Heading alignSelf={'center'}>Create a post</Heading>
                <PostForm />
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
