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
        <Container border='2px solid blue' margin='auto'>
            <Stack direction='column'>
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
