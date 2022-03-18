import Head from 'next/head'
import styles from './layout.module.css'

function Layout({ children }) {
    return (
        <>
            <Head>
                <title>Layouts Example</title>
            </Head>
            <main className={styles.main}>{children}</main>
        </>
    )
}

export default Layout
