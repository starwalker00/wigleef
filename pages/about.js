import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useConnect } from 'wagmi'

// const isServerSide = typeof window === 'undefined'

function About() {
    return (
        <section>
            <h2>Layout Example (About)</h2>
        </section>
    )
}

About.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar />
            {page}
        </Layout>
    )
}

export default About
