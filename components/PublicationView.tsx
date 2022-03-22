import NextLink from 'next/link'
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link
} from '@chakra-ui/react'
import { FaTwitter } from 'react-icons/fa'
import ReactTimeAgo from 'react-time-ago'
import CommentView from '../components/CommentView'
import MarkdownRenderer from './MarkdownRenderer'
import Pluralize from 'react-pluralize'

function PublicationView(dataPublication) {
    // console.log(dataPublication)
    const publication = dataPublication.publication;
    // console.log(publication)
    if (publication.length < 1) {
        return <h1>no pub</h1>
    }
    const comments = dataPublication.comments;
    // console.log(comments)
    return (
        <>
            <LinkBox as='article' style={{ border: "2px solid #eee", padding: "1rem", marginBottom: "1rem", borderRadius: "10px" }}
                _hover={{
                    cursor: 'pointer',
                    backgroundColor: 'gray.100'
                }}
            >
                <Flex flexDirection='row' justifyContent='flex-start' gap='2'>
                    <NextLink
                        href={{
                            pathname: '/publication/[publicationID]',
                            query: { publicationID: publication.id },
                        }}
                        passHref
                    /*auto prefetch : https://nextjs.org/docs/messages/prefetch-true-deprecated is it really working ? */>
                        <LinkOverlay>
                            <Text
                                color={'green.500'}
                                textTransform={'uppercase'}
                                fontWeight={800}
                                fontSize={'sm'}
                                letterSpacing={1.1}>
                                {publication.__typename}
                            </Text>
                            <Text
                                color={'green.500'}
                                textTransform={'uppercase'}
                                fontWeight={800}
                                fontSize={'sm'}
                                letterSpacing={1.1}>
                                {publication.id}</Text>
                        </LinkOverlay>
                    </NextLink >
                </Flex>
                <Flex flexDirection='column'>
                    <Flex className='profile' alignItems='center' bgColor='blue.50' py='1'>
                        <Avatar size='md' src={publication.profile?.picture} />
                        <Flex ml='2' alignItems='center'>
                            <Text fontSize='lg' fontWeight='bold'>
                                {publication.profile?.handle}
                                {/* <Badge ml='1' colorScheme='green'>New</Badge> */}
                                {publication.profile?.twitterUrl
                                    ?
                                    <NextLink href={'https://www.google.fr'} passHref>
                                        <Link>
                                            <IconButton aria-label='Search database'
                                                variant='ghost'
                                                icon={<Icon as={FaTwitter} w={6} h={6} color='blue.500' />} />
                                        </Link>
                                    </NextLink>
                                    :
                                    null}
                            </Text>
                            <Text fontSize='xs'><ReactTimeAgo date={new Date(publication.createdAt)} timeStyle="twitter" /></Text>
                        </Flex>
                    </Flex>
                    <Flex className='metadata' flexDirection='column' alignContent='center' bgColor='blue.100'>
                        <Heading
                            color={'gray.700'}
                            fontSize={'sm'}
                            fontFamily={'body'}>
                            {publication.metadata?.name}
                        </Heading>
                        <Text fontSize='xs' color={'gray.500'}>{publication.metadata?.description}</Text>
                        {/* <Text fontSize='sm' color={'gray.800'}>{publication.metadata?.content}</Text> */}
                        <Box m='3' p='3' borderLeft='1px solid green'>
                            <MarkdownRenderer markdownString={publication.metadata?.content} />
                        </Box>
                    </Flex>
                    <Divider my='2' />
                    <Flex className='stats' flexDirection='row' justifyContent='space-around' gap='2' alignContent='center'>
                        <Text fontSize='xs' color={'gray.500'}>
                            <Pluralize singular={'comment'} plural={'comments'} zero={'No comments'} count={publication.stats?.totalAmountOfComments} />
                        </Text>
                        <Text fontSize='xs' color={'gray.500'}>
                            <Pluralize singular={'collect'} plural={'collects'} zero={'No collects'} count={publication.stats?.totalAmountOfCollects} />
                        </Text>
                        <Text fontSize='xs' color={'gray.500'}>
                            <Pluralize singular={'mirror'} plural={'mirrors'} zero={'No mirrors'} count={publication.stats?.totalAmountOfMirrors} />
                        </Text>
                    </Flex>
                </Flex>
            </LinkBox>
            {comments && comments.map((comment) => {
                return (
                    <CommentView key={comment.id} comment={comment} />
                )
            })
            }
        </>
    );
}

export default PublicationView;

// {
//     "__typename": "Post",
//     "id": "0x1c-0x01",
//     "profile": {
//       "id": "0x1c",
//       "name": null,
//       "bio": null,
//       "location": null,
//       "website": null,
//       "twitterUrl": null,
//       "handle": "oneski22",
//       "picture": null,
//       "coverPicture": null,
//       "ownedBy": "0x52EAF3F04cbac0a4B9878A75AB2523722325D4D4",
//       "depatcher": null,
//       "stats": {
//         "totalFollowers": 0,
//         "totalFollowing": 1,
//         "totalPosts": 1,
//         "totalComments": 0,
//         "totalMirrors": 1,
//         "totalPublications": 2,
//         "totalCollects": 0
//       },
//       "followModule": null
//     },
//     "stats": {
//       "totalAmountOfMirrors": 1,
//       "totalAmountOfCollects": 0,
//       "totalAmountOfComments": 0
//     },
//     "metadata": {
//       "name": "some name",
//       "description": "some description",
//       "content": "testing 123",
//       "media": null,
//       "attributes": []
//     },
//     "createdAt": "2022-02-17T13:35:47.000Z",
//     "collectModule": {
//       "__typename": "EmptyCollectModuleSettings",
//       "type": "EmptyCollectModule"
//     },
//     "referenceModule": null,
//     "appId": null
//   },