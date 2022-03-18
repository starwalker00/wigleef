import Link from 'next/link'
import styles from './sidebar.module.css'

function Sidebar() {
    return (
        <nav className={styles.nav}>
            <input className={styles.input} placeholder="Search..." />
            <Link href="/">
                <a>Home</a>
            </Link>
            <Link href="/explore">
                <a>Explore</a>
            </Link>
            <Link href="/post">
                <a>Post</a>
            </Link>
            <Link href="/about">
                <a>About</a>
            </Link>
        </nav>
    )
}

export default Sidebar
