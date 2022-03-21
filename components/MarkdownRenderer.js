import markdownToHtml from '../lib/markdownToHtml'
import { useEffect, useState } from 'react';
import markdownStyles from './markdown-styles.module.css'
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'
import MDEditor from '@uiw/react-md-editor';

function MarkdownRenderer({ markdownString }) {
    const [content, setContent] = useState()
    useEffect(() => {
        async function mdToHtml() {
            const response = await markdownToHtml(markdownString) || '';
            setContent(response);
        }
        mdToHtml();
    }, [markdownString]);

    if (!content) {
        return (
            <Skeleton height='20px' />
        );
    } else {
        return (
            <div>
                <MDEditor.Markdown source={content} />
            </div>
        );
    }
}

export default MarkdownRenderer;
