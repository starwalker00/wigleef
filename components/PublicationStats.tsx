import NextLink from 'next/link'
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link, Button, Collapse, Portal
} from '@chakra-ui/react'
import { Fade, ScaleFade, Slide, SlideFade } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { FaTwitter } from 'react-icons/fa'
import ReactTimeAgo from 'react-time-ago'
import CommentView from '../components/CommentView'
import MarkdownRenderer from './MarkdownRenderer'
import Pluralize from 'react-pluralize'

function PublicationStats({ publicationStats }) {
    const { isOpen: isOpenComment, onToggle: isToggleComment } = useDisclosure()
    const { isOpen: isOpenCollect, onToggle: isToggleCollect } = useDisclosure()
    const { isOpen: isOpenMirror, onToggle: isToggleMirror } = useDisclosure()
    return (
        <>
            <Flex className='stats' flexDirection='row' justifyContent='space-around' gap='2' alignContent='center'>
                {/* <CommentButton totalAmountOfComments={publication.stats?.totalAmountOfComments} />
                         */}
                <Flex className='stats-comments' flexDirection='column' alignContent='center'>
                    <Text fontSize='xs' color={'gray.500'}>
                        <Pluralize singular={'comment'} plural={'comments'} zero={'No comments'} count={publicationStats.totalAmountOfComments} />
                    </Text>
                    <Button size='xs' zIndex='2' onClick={isToggleComment}>comment</Button>
                </Flex>
                <Flex className='stats-collects' flexDirection='column' alignContent='center'>
                    <Text fontSize='xs' color={'gray.500'}>
                        <Pluralize singular={'collect'} plural={'collects'} zero={'No collects'} count={publicationStats.totalAmountOfCollects} />
                    </Text>
                    <Button size='xs' zIndex='2' onClick={isToggleCollect}>collect</Button>
                </Flex>
                <Flex className='stats-collects' flexDirection='column' alignContent='center'>
                    <Text fontSize='xs' color={'gray.500'}>
                        <Pluralize singular={'mirror'} plural={'mirrors'} zero={'No mirrors'} count={publicationStats.totalAmountOfMirrors} />
                    </Text>
                    <Button size='xs' zIndex='2' onClick={isToggleMirror}>mirror</Button>
                </Flex>
            </Flex>
            <Collapse in={isOpenComment} animateOpacity>
                <Box
                    p='40px'
                    color='white'
                    mt='4'
                    bg='teal.500'
                    rounded='md'
                    shadow='md'
                >
                    <MarkdownRenderer markdownString={'comment: put the markdown editor here and the post button'} />
                </Box>
            </Collapse>
            <Collapse in={isOpenCollect} animateOpacity>
                <Box
                    p='40px'
                    color='white'
                    mt='4'
                    bg='teal.500'
                    rounded='md'
                    shadow='md'
                >
                    <MarkdownRenderer markdownString={'collect'} />
                </Box>
            </Collapse>
            <Collapse in={isOpenMirror} animateOpacity>
                <Box
                    p='40px'
                    color='white'
                    mt='4'
                    bg='teal.500'
                    rounded='md'
                    shadow='md'
                >
                    <MarkdownRenderer markdownString={'mirror'} />
                </Box>
            </Collapse>
        </>
    );
}

export default PublicationStats;
