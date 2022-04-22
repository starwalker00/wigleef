import {
    Heading,
    Avatar,
    Box,
    Center,
    Text,
    Stack,
    Button,
    Link,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';
import { profile } from 'console';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

export default function SocialProfileSimple({ profile }) {
    const router = useRouter();
    return (
        <Center py={2}>
            <Box
                maxW={'320px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                rounded={'lg'}
                p={6}
                textAlign={'center'}>
                <Avatar
                    size={'lg'}
                    src={profile?.picture?.original?.url}
                    mb={4}
                />
                <Heading fontSize={'md'} fontFamily={'body'}>
                    {profile?.name}
                </Heading>
                <Text fontSize={'md'} fontWeight={600} color={'gray.500'} mb={4}>
                    @{profile?.handle} — {profile?.id}
                </Text>
                {/* <Text 
                    textAlign={'center'}
                    color={useColorModeValue('gray.700', 'gray.400')}
                    px={3}>
                    Actress, musician, songwriter and artist. PM for work inquires or{' '}
                    <Link href={'#'} color={'blue.400'}>
                        #tag
                    </Link>{' '}
                    me in your posts
                </Text> */}
                <Stack direction={'row'} justify={'center'} spacing={6}>
                    <Stack spacing={0} align={'center'}>
                        <Text fontWeight={600}>{profile.stats.totalPosts}</Text>
                        <Text fontSize={'sm'} color={'gray.500'}>
                            Posts
                        </Text>
                    </Stack>
                    <Stack spacing={0} align={'center'}>
                        <Text fontWeight={600}>{profile.stats.totalFollowers}</Text>
                        <Text fontSize={'sm'} color={'gray.500'}>
                            Followers
                        </Text>
                    </Stack>
                </Stack>

                <Stack mt={8} direction={'row'} spacing={4}>
                    <Button
                        onClick={() => {
                            router.push({
                                pathname: '/timeline/[profileID]',
                                query: { profileID: profile?.id },
                            })
                        }}
                        flex={1}
                        fontSize={'sm'}
                        // rounded={'full'}
                        _focus={{
                            bg: 'gray.200',
                        }}>
                        Timeline
                    </Button>
                    <Button
                        onClick={() => {
                            router.push({
                                pathname: '/profile/[profileID]',
                                query: { profileID: profile?.id },
                            })
                        }}
                        flex={1}
                        fontSize={'sm'}
                        // rounded={'full'}
                        _focus={{
                            bg: 'gray.200',
                        }}>
                        Profile
                    </Button>
                </Stack>
            </Box>
        </Center>
    );
}

// {__typename: 'Profile', id: '0x78', name: 'Sasi', bio: null, location: null, …}
// bio: null
// coverPicture: null
// depatcher: null
// followModule: null
// handle: "sasi.codes"
// id: "0x78"
// location: null
// name: "Sasi"
// ownedBy: "0x01d79BcEaEaaDfb8fD2F2f53005289CFcF483464"
// picture:
// medium: null
// original: {__typename: 'Media', url: 'https://ipfs.infura.io/ipfs/QmXGoeBsAyaFXaz3Z1CDtGWczakhaWPcDbBqCM4YqgkXpw', width: null, height: null, mimeType: null}
// small: null
// __typename: "MediaSet"
// [[Prototype]]: Object
// stats: {__typename: 'ProfileStats', totalFollowers: 0, totalFollowing: 5, totalPosts: 7, totalComments: 2, …}
// twitter: "https://twitter.com/sasicodes"
// website: "https://sasi.codes"
// __typename: "Profile"