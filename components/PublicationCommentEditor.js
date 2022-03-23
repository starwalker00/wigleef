import { useState } from 'react';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link, Button, Collapse, Portal, Spacer, CloseButton
} from '@chakra-ui/react'
import MarkdownEditor from '../components/MarkdownEditor'

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

function PublicationCommentEditor({ isOpenComment, isToggleComment }) {
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");
    return (
        <Collapse in={isOpenComment} animateOpacity>
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
                    <CloseButton alignSelf='flex-end' onClick={isToggleComment} size='sm' />
                    <MarkdownEditor />
                    <Button alignSelf='flex-end' size='sm' mt='4px'>Post comment</Button>
                </Flex>
            </Flex>
        </Collapse>
    )
}

export default PublicationCommentEditor;
