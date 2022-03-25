import { forwardRef } from 'react';
import {
    Box,
    Flex,
    Avatar,
    Link,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    VStack,
    Portal
} from '@chakra-ui/react';
import { Show, Hide } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import NextLink from 'next/link'
import styles from './sidebar.module.css'
import { UNSET_CONTEXT_PROFILE_ID } from '../lib/config';
import { BiSpreadsheet, BiHomeAlt, BiWorld, BiSearch, BiUserCircle } from 'react-icons/bi'
import ConnectButtonAndModal from '../components/ConnectButtonAndModal'
import { BigNumber } from "@ethersproject/bignumber";
import { useProfileID } from "../components/context/AppContext";
import { namedConsoleLog } from '../lib/helpers';
import SearchBar from '../components/SearchBar';
import SearchModal from '../components/mobileOnly/SearchModal';

function Sidebar({ children }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    //@ts-ignore
    const { profileIDApp } = useProfileID();
    const myProfileIDhexString: string = profileIDApp.eq(UNSET_CONTEXT_PROFILE_ID) ? '0x49' : profileIDApp.toHexString();
    // TODO
    // disable "my profile" link if profileIDApp = 0, meaning user not connected
    // or make a beautiful demo profile
    return (
        <>
            {/* menu on md size and below */}
            <Show below='md'>
                {/* top bar */}
                <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} position='sticky' top='0' zIndex='200' width='100%'>
                    <Flex h={16} alignItems={'center'} justifyContent={'center'} >
                        Logo
                    </Flex>
                </Box>
                {children}
                {/* bottom bar */}
                <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} position='fixed' bottom='0' zIndex='200' width='100%'>
                    <Flex h={16} alignItems={'center'} justifyContent={'space-around'} >
                        <NextLink
                            href={{
                                pathname: '/timeline/[profileID]',
                                query: { profileID: myProfileIDhexString },
                            }}
                            passHref
                        >
                            <Link>
                                <BiHomeAlt />
                            </Link>
                        </NextLink>
                        <NextLink href={'/explore'} passHref>
                            <Link>
                                <BiWorld />
                            </Link>
                        </NextLink>
                        <NextLink
                            href={{
                                pathname: '/profile/[profileID]',
                                query: { profileID: myProfileIDhexString },
                            }}
                            passHref
                        >
                            <Link>
                                <BiUserCircle />
                            </Link>
                        </NextLink>
                        <SearchModal />
                    </Flex>
                </Box>
            </Show>
            {/* menu above md size */}
            <Show above='md'>
                <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} position='sticky' top='0' zIndex='200' width='100%' maxWidth='20%'>
                    <Flex alignItems={'center'} justifyContent={'space-around'}>
                        <Stack direction={'column'} alignItems={'center'}>
                            <Box>Logo</Box>
                            <VStack
                                as={'nav'}
                                spacing={4}
                            >
                                <NextLink
                                    href={{
                                        pathname: '/timeline/[profileID]',
                                        query: { profileID: myProfileIDhexString },
                                    }}
                                    passHref
                                >
                                    <Link>Timeline</Link>
                                </NextLink>
                                <NextLink href={'/explore'} passHref>
                                    <Link>Explore</Link>
                                </NextLink>
                                <NextLink href={'/post'} passHref>
                                    <Link>Post</Link>
                                </NextLink>
                                <NextLink href={'/comment'} passHref>
                                    <Link>Comment</Link>
                                </NextLink>
                                <NextLink href={'/about'} passHref>
                                    <Link>About</Link>
                                </NextLink>
                                <NextLink
                                    href={{
                                        pathname: '/profile/[profileID]',
                                        query: { profileID: myProfileIDhexString },
                                    }}
                                    passHref
                                >
                                    <Link>My Profile</Link>
                                </NextLink>
                                <SearchBar />
                            </VStack>
                            {/* color mode icon */}
                            {/* <Button onClick={toggleColorMode}>
                                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            </Button> */}
                            {/* user icon */}
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    rounded={'full'}
                                    variant={'link'}
                                    cursor={'pointer'}
                                    minW={0}>
                                    <Avatar
                                        size={'sm'}
                                        src={'https://avatars.dicebear.com/api/male/username.svg'}
                                    />
                                </MenuButton>
                                <MenuList alignItems={'center'}>
                                    <br />
                                    <Center>
                                        <Avatar
                                            size={'2xl'}
                                            src={'https://avatars.dicebear.com/api/male/username.svg'}
                                        />
                                    </Center>
                                    <br />
                                    <Center>
                                        <p>Username</p>
                                    </Center>
                                    <br />
                                    <MenuDivider />
                                    <MenuItem>Your Servers</MenuItem>
                                    <MenuItem>Account Settings</MenuItem>
                                    <MenuItem>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                            <ConnectButtonAndModal />
                        </Stack>
                    </Flex>
                </Box>
                {children}
            </Show>
        </>
    );
}

export default Sidebar
