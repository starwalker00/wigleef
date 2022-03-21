import markdownToHtml from '../lib/markdownToHtml'
import { useEffect, useState } from 'react';
import markdownStyles from './markdown-styles.module.css'
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

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
            <div>
                <div>
                    <Skeleton height='20px' />
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div>
                    <div
                        className={markdownStyles['markdown']}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        );
    }
}

export default MarkdownRenderer;
