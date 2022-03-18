import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import Metadata from '../lib/metadata'

function Post() {
    let post: Metadata;
    return (
        <section>
            <h2>Post</h2>
            <p>
                This example adds a property <code>getLayout</code> to your page,
                allowing you to return a React component for the layout. This allows you
                to define the layout on a per-page basis. Since we&apos;re returning a
                function, we can have complex nested layouts if desired.
            </p>
        </section>
    )
}

Post.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar />
            {page}
        </Layout>
    )
}

export default Post
