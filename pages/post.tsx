import {
    Stack,
    Container
} from '@chakra-ui/react';
import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PostForm from '../components/PostForm';

function Post() {
    return (
        <Container border='2px solid blue'>
            <h2>Post</h2>
            <Stack
                border='2px solid green'
                direction='column'
            // justifyContent='space-around'
            // alignItems='stretch'
            >
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
