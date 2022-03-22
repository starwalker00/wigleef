import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import rehypeSanitize from "rehype-sanitize";
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

const MarkdownPreview = dynamic(
    () => import("@uiw/react-markdown-preview"),
    { ssr: false }
);

function MarkdownRenderer({ markdownString }) {
    if (!markdownString || typeof markdownString != "string") {
        return (
            <div>
            </div>
        );
    } else {
        return (
            <div>
                {/* {console.log(`markdownString: ${markdownString}`)} */}
                <MarkdownPreview source={markdownString} rehypePlugins={[[rehypeSanitize]]} />
                {/* <MarkdownPreview source={'<iframe src="javascript:alert(\'delta\')" ></iframe>'} /> */}
            </div >
        );
    }
}

export default MarkdownRenderer
