import NextLink from 'next/link'
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link, Button, Collapse, Portal, Spacer, CloseButton
} from '@chakra-ui/react'
import { Fade, ScaleFade, Slide, SlideFade } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { FaTwitter } from 'react-icons/fa'
import ReactTimeAgo from 'react-time-ago'
import CommentView from '../components/CommentView'
import MarkdownRenderer from './MarkdownRenderer'
import Pluralize from 'react-pluralize'
import MarkdownEditor from '../components/MarkdownEditor'
import PublicationCommentEditor from './PublicationCommentEditor'

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
                    <Button size='xs' zIndex='2' onClick={isToggleComment}>Comment</Button>
                </Flex>
                <Flex className='stats-collects' flexDirection='column' alignContent='center'>
                    <Text fontSize='xs' color={'gray.500'}>
                        <Pluralize singular={'collect'} plural={'collects'} zero={'No collects'} count={publicationStats.totalAmountOfCollects} />
                    </Text>
                    <Button size='xs' zIndex='2' onClick={isToggleCollect}>Collect</Button>
                </Flex>
                <Flex className='stats-collects' flexDirection='column' alignContent='center'>
                    <Text fontSize='xs' color={'gray.500'}>
                        <Pluralize singular={'mirror'} plural={'mirrors'} zero={'No mirrors'} count={publicationStats.totalAmountOfMirrors} />
                    </Text>
                    <Button size='xs' zIndex='2' onClick={isToggleMirror}>Mirror</Button>
                </Flex>
            </Flex>
            <PublicationCommentEditor isOpenComment={isOpenComment} isToggleComment={isToggleComment} />
            <Collapse in={isOpenCollect} animateOpacity>
                <Flex flexDirection='column'>
                    <Flex
                        flexDirection='column'
                        p='10px'
                        color='white'
                        mt='4'
                        bg='blue.500'
                        rounded='md'
                        shadow='md'
                        zIndex='2'
                    >
                        <CloseButton alignSelf='flex-end' onClick={isToggleCollect} size='sm' />
                        <MarkdownRenderer markdownString={'collect'} />
                    </Flex>
                </Flex>
            </Collapse>
            <Collapse in={isOpenMirror} animateOpacity>
                <Flex flexDirection='column'>
                    <Flex
                        flexDirection='column'
                        p='10px'
                        color='white'
                        mt='4'
                        bg='blue.500'
                        rounded='md'
                        shadow='md'
                        zIndex='2'
                    >
                        <CloseButton alignSelf='flex-end' onClick={isToggleMirror} size='sm' />
                        <MarkdownRenderer markdownString={'mirror'} />
                    </Flex>
                </Flex>
            </Collapse>
        </>
    );
}

export default PublicationStats;
