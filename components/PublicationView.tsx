import NextLink from 'next/link'
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox
} from '@chakra-ui/react'
import { FaTwitter } from 'react-icons/fa'
import ReactTimeAgo from 'react-time-ago'
import CommentView from '../components/CommentView'
import MarkdownRenderer from './MarkdownRenderer'

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
                        <Flex flexDirection='column'>
                            <Flex className='profile'>
                                <Avatar src={publication.profile?.picture} />
                                <Box ml='3'>
                                    <Text fontWeight='bold'>
                                        {publication.profile?.handle}
                                        {/* <Badge ml='1' colorScheme='green'>New</Badge> */}
                                        {publication.profile?.twitterUrl
                                            ?
                                            <NextLink href={'https://www.google.fr'} passHref>
                                                <IconButton aria-label='Search database'
                                                    variant='ghost'
                                                    icon={<Icon as={FaTwitter} w={6} h={6} color='blue.500' />} />
                                            </NextLink>
                                            :
                                            null}
                                    </Text>
                                    <Text fontSize='sm'>{publication.profile?.id}</Text>
                                    <Text fontSize='xs'><ReactTimeAgo date={new Date(publication.createdAt)} timeStyle="twitter" /></Text>
                                </Box>
                            </Flex>
                            <Flex className='metadata' flexDirection='column' alignContent='center' ml='3'>
                                <Heading
                                    color={'gray.700'}
                                    fontSize={'sm'}
                                    fontFamily={'body'}>
                                    {publication.metadata?.name}
                                </Heading>
                                <Text fontSize='xs' color={'gray.500'}>{publication.metadata?.description}</Text>
                                {/* <Text fontSize='sm' color={'gray.800'}>{publication.metadata?.content}</Text> */}
                                <MarkdownRenderer markdownString={publication.metadata?.content} />
                                <Divider my='2' />
                            </Flex>
                            <Flex className='stats' flexDirection='row' bgColor='blue' justifyContent='space-around' gap='2' alignContent='center'>
                                <Text fontSize='xs' color={'gray.500'}>{publication.stats?.totalAmountOfComments}{''} comments</Text>
                                <Text fontSize='xs' color={'gray.500'}>{publication.stats?.totalAmountOfCollects} collects</Text>
                                <Text fontSize='xs' color={'gray.500'}>{publication.stats?.totalAmountOfMirrors} mirrors</Text>
                            </Flex>
                        </Flex>
                    </LinkOverlay>
                </NextLink >
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