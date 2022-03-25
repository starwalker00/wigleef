import {
    Heading,
    Avatar,
    Box,
    Center,
    Image,
    Flex,
    Text,
    Stack,
    Button,
    useColorModeValue,
    Link,
    Spacer,
    Tag
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import FollowingListDrawer from './FollowingListDrawer';
import FollowerListDrawer from './FollowerListDrawer';
import { useAccount } from 'wagmi';
import { useProfileID, useDispatchProfileID } from "./context/AppContext";
import { BigNumber } from "@ethersproject/bignumber";
import { namedConsoleLog } from '../lib/helpers';

export default function SocialProfileWithImage({ profile }) {
    // check connected wallet
    const [{ data: accountData }, disconnect] = useAccount();
    const connectedWalletAddress = accountData?.address;
    const isProfileOfConnectedWalletAddress = accountData?.address === profile.ownedBy;
    // namedConsoleLog('isProfileOfConnectedWalletAddress', isProfileOfConnectedWalletAddress);

    // check connected profileID
    const { profileIDApp } = useProfileID();
    const isProfileIDConnected = isProfileOfConnectedWalletAddress && profileIDApp.eq(BigNumber.from(profile?.id));
    // namedConsoleLog('isProfileOfConnectedWalletAddress', isProfileOfConnectedWalletAddress);
    const dispatch = useDispatchProfileID();

    function changeProfileID(event) {
        dispatch({ type: 'set_profileID', payload: BigNumber.from(profile?.id) });
    }

    return (
        <Center py={6}>
            <Box
                // maxW={'270px'}
                w={'full'}
                // bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'lg'}
                rounded={'md'}
                overflow={'hidden'}>
                <Image
                    maxHeight='200px'
                    // h={'120px'}
                    w={'full'}
                    // src={
                    //     'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
                    // }
                    src={profile?.coverPicture?.original?.url}
                    fallbackSrc={'/placeholder1200x400.png'} //'https://via.placeholder.com/1200x400?text=No+cover+picture+set'
                    objectFit={'cover'}
                />
                <Flex justify={'center'} mt={-12}>
                    <Avatar
                        size={'xl'}
                        // src={
                        //     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
                        // }
                        src={profile?.picture?.original?.url}
                        alt={'Author'}
                        css={{
                            border: '2px solid white',
                        }}
                    />
                </Flex>

                <Box p={6}>
                    {/* handle /followers / following */}
                    <Stack direction={'row'} justify={'center'} spacing={6} mb={5}>
                        <Stack spacing={0} align={'center'}>
                            <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                                {profile?.name}
                            </Heading>
                            <Text fontSize={'sm'} color={'gray.500'}>@{profile?.handle} — {profile?.id}</Text>
                            {isProfileIDConnected ? <Tag size='sm'>YOU!</Tag> : null}
                        </Stack>
                        <Spacer />
                        <Stack spacing={0} align={'center'}>
                            <Text fontWeight={600}>{profile?.stats?.totalFollowers || 0}</Text>
                            <Text fontSize={'sm'} color={'gray.500'}>
                                Followers
                            </Text>
                            <FollowerListDrawer profileString={profile?.name || profile?.handle} profileId={profile.id} />
                        </Stack>
                        <Stack spacing={0} align={'center'}>
                            <Text fontWeight={600}>{profile?.stats?.totalFollowing || 0}</Text>
                            <Text fontSize={'sm'} color={'gray.500'}>
                                Following
                            </Text>
                            <FollowingListDrawer walletAddress={profile.ownedBy} />
                        </Stack>
                    </Stack>
                    {/* bio */}
                    {profile?.bio ?
                        <Stack direction={'column'} width={'full'} mb={5}>
                            <Text fontSize={'sm'} fontWeight={100}>{profile.bio}</Text>
                        </Stack>
                        : null
                    }
                    {/* website / location */}
                    <Stack direction={'column'} width={'full'} spacing={1}>
                        {profile?.location ?
                            <Text fontSize={'sm'} fontWeight={100}>{profile.location}</Text>
                            : null
                        }
                        {profile?.website ?
                            <Link href={profile.website} isExternal>
                                <Text fontSize={'sm'} fontWeight={100}>{profile.website} <ExternalLinkIcon mx='2px' /></Text>
                            </Link>
                            : null
                        }
                    </Stack>
                    <Stack direction={'row'} width={'full'} spacing={1}>
                        <Text fontSize={'sm'} fontWeight={100}>Owner :</Text>
                        <Text fontSize={'sm'} fontWeight={100}>{profile.ownedBy}</Text>{isProfileOfConnectedWalletAddress ? <Tag size='sm'>YOU!</Tag> : null}
                        {isProfileOfConnectedWalletAddress && !isProfileIDConnected ? <Button size='sm' variant='outline' onClick={changeProfileID} >use this profile</Button> : null}
                    </Stack>


                    {
                        false ?
                            <Button
                                w={'full'}
                                mt={8}
                                // bg={useColorModeValue('#151f21', 'gray.900')}
                                // colorScheme={'green'}
                                // color={'white'}
                                rounded={'md'}
                                isActive={false}
                                // isDisabled={true}
                                _hover={{
                                    // transform: 'translateY(-2px)',
                                    // boxShadow: 'lg',
                                    cursor: 'not-allowed'
                                }}
                            >
                                Followed
                            </Button>
                            :
                            <Button
                                w={'full'}
                                mt={8}
                                // bg={useColorModeValue('#151f21', 'gray.900')}
                                // backgroundColor={'#151f21'}
                                // color={'white'}
                                rounded={'md'}
                                _hover={{
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                            >
                                Follow
                            </Button>
                    }
                </Box>
            </Box>
        </Center >
    );
}


// bio: "요기 • Creator of @lensterxyz 🌿 • Developer at @CRED_club • Ecosystem dev at @ENS_DAO 🤝 • FDD at @GitcoinDAO 🛡️ • Bullish on Ξ • BTS Fanboi ⟬⟭ • he/him 🌳"
// coverPicture:
// original: {__typename: 'Media', url: 'https://ipfs.infura.io/ipfs/QmR7vBHZm78hsymxYFkQBV4UC42Y4iGyHgyFwisMu9S66B', mimeType: null}
// __typename: "MediaSet"
// [[Prototype]]: Object
// depatcher: null
// followModule: null
// handle: "yoginth"
// id: "0x13"
// location: "India"
// name: "Yoginth"
// ownedBy: "0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3"
// picture:
// original: {__typename: 'Media', url: 'https://ipfs.infura.io/ipfs/Qma8mXoeorvPqodDazf7xqARoFD394s1njkze7q1X4CK8U', mimeType: null}
// __typename: "MediaSet"
// [[Prototype]]: Object
// stats:
// totalCollects: 25
// totalComments: 38
// totalFollowers: 16
// totalFollowing: 18
// totalMirrors: 3
// totalPosts: 68
// totalPublications: 109
// __typename: "ProfileStats"
// [[Prototype]]: Object
// twitterUrl: "https://twitter.com/yogicodes"
// website: "https://yogi.codes"
// __typename: "Profile"