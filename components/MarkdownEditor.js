import { useState } from 'react';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { Box } from '@chakra-ui/layout';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

function MarkdownEditor() {
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");
    return (
        <Box>
            <MDEditor value={markdownValue} onChange={setMarkdownValue} />
        </Box>
    )
}

export default MarkdownEditor;
