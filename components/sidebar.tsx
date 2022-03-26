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
    Portal,
    Spacer,
    Text,
    Divider
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
import { ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

function Sidebar({ children }) {
    const router = useRouter();
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
                <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} position='sticky' top='0' zIndex='200' maxWidth='20%'>
                    <Stack direction={'column'} alignItems={'center'} border='2px solid red' height='90vh'>
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
                                <Button
                                    rounded={'full'}
                                    size={'lg'}
                                    fontWeight={'normal'}
                                    px={6}
                                // leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                                >
                                    Timeline
                                </Button>
                            </NextLink>
                            <NextLink href={'/explore'} passHref>
                                <Button
                                    rounded={'full'}
                                    size={'lg'}
                                    fontWeight={'normal'}
                                    px={6}
                                // leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                                >
                                    Explore
                                </Button>
                            </NextLink>
                            <NextLink href={'/post'} passHref>
                                <Button
                                    rounded={'full'}
                                    size={'lg'}
                                    fontWeight={'normal'}
                                    px={6}
                                    leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                                >
                                    New post
                                </Button>
                            </NextLink>
                            <NextLink href={'/createProfile'} passHref>
                                <Button
                                    rounded={'full'}
                                    size={'lg'}
                                    fontWeight={'normal'}
                                    px={6}
                                    leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                                >
                                    New profile
                                </Button>
                            </NextLink>
                            {/* <NextLink href={'/about'} passHref>
                                    <Link>About</Link>
                                </NextLink> */}
                            <NextLink
                                href={{
                                    pathname: '/profile/[profileID]',
                                    query: { profileID: myProfileIDhexString },
                                }}
                                passHref
                            >
                                <Button
                                    rounded={'full'}
                                    size={'lg'}
                                    fontWeight={'normal'}
                                    px={6}
                                // leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                                >
                                    My profile
                                </Button>
                            </NextLink>
                            <Spacer />
                            <Stack spacing='1' backgroundColor='white' p={2}>
                                <Text fontSize='sm' alignSelf='flex-start' px={2}>Search profiles: </Text>
                                <SearchBar />
                            </Stack>
                            {/* color mode icon */}
                            {/* <Button onClick={toggleColorMode}>
                                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            </Button> */}
                            {/* user icon */}
                        </VStack>
                        <Spacer />
                        <Divider orientation='horizontal' variant='dashed' />
                        <VStack width='full'>
                            <Menu>
                                <MenuButton
                                    onClick={() => {
                                        router.push({
                                            pathname: '/profile/[profileID]',
                                            query: { profileID: myProfileIDhexString },
                                        })
                                    }}
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
                                    <MenuItem>Notifications</MenuItem>
                                    <MenuItem>Account Settings</MenuItem>
                                </MenuList>
                            </Menu>
                            <ConnectButtonAndModal />
                        </VStack>
                    </Stack>
                </Box>
                {children}
            </Show>
        </>
    );
}

export default Sidebar
