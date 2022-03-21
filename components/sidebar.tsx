import Link from 'next/link'
import styles from './sidebar.module.css'

import ConnectButtonAndModal from '../components/ConnectButtonAndModal'
import { ethers } from 'ethers';
import { useProfileID } from "../components/context/AppContext";

function Sidebar() {
    const profileIDApp: ethers.BigNumber = useProfileID();

    const myProfileIDhexString: string = profileIDApp.eq(0) ? '0x49' : profileIDApp.toHexString();
    // TODO
    // disable "my profile" link if profileIDApp = 0, meaning user not connected
    // or make a beautiful demo profile

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
            <Link href="/comment">
                <a>Comment</a>
            </Link>
            <Link
                href={{
                    pathname: '/profile/[profileID]',
                    query: { profileID: myProfileIDhexString },
                }}
            >
                <a>My Profile</a>
            </Link>
            <Link href="/about">
                <a>About</a>
            </Link>
            <ConnectButtonAndModal />
        </nav>
    )
}

export default Sidebar
