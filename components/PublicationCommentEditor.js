import { useState } from 'react';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link, Button, Collapse, Portal, Spacer, CloseButton,
    Skeleton
} from '@chakra-ui/react'
import MarkdownEditor from '../components/MarkdownEditor'
import { gql, useQuery } from "@apollo/client";
import { useSignMessage, useSignTypedData, useContractWrite, useSigner, useAccount } from 'wagmi';
import { generateChallenge } from '../lib/apollo/generate-challenge'
import { authenticate } from '../lib/apollo/authenticate'
import { namedConsoleLog, omit } from '../lib/helpers';
import { v4 as uuidv4 } from 'uuid';
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { createCommentTypedData } from '../lib/apollo/create-comment-typed-data';
import { ipfsClient } from '../lib/ipfs-client';
import { Metadata, MetadataVersions } from '../lib/metadata'
import { useProfileID } from "../components/context/AppContext";
import { LENS_HUB_ABI } from '../lib/abi';
import { ethers, utils, Wallet } from 'ethers';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

const VERIFY = `
  query($request: VerifyRequest!) {
    verify(request: $request)
  }
`;

function PublicationCommentEditor({ isOpenComment, isToggleComment, publicationID }) {
    // app context in-use profileID (BN)
    const profileIDApp = useProfileID();
    // wagmi hooks
    const [{ data: dataAccount, error: errorAccount, loading: loadingAccount }, disconnect] = useAccount();
    const [{ data: dataSignMessage, error: errorSignMessage, loading: loadingSignMessage }, signMessage] = useSignMessage();
    const [{ data: dataSignTypedData, error: errorSignTypedData, loading: loadingSignTypedData }, signTypedData] = useSignTypedData();
    const [{ data: dataContractWrite, error: errorContractWrite, loading: loadingContractWrite }, write] = useContractWrite(
        {
            addressOrName: '0xd7B3481De00995046C7850bCe9a5196B7605c367',
            contractInterface: LENS_HUB_ABI,
        },
        'commentWithSig'
    );
    // transaction status
    const [isBlockchainTxPending, setIsBlockchainTxPending] = useState(false);
    // markdown editor
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");

    async function clickPostComment() {
        // TODO: migrate to apollo hooks later ?
        // alert('clickComment');
        // namedConsoleLog('dataAccount', dataAccount);
        // namedConsoleLog('errorAccount', errorAccount);
        // namedConsoleLog('loadingAccount', loadingAccount);

        let comment = {
            version: MetadataVersions.one,
            metadata_id: uuidv4(),
            description: 'Description',
            content: markdownValue,
            external_url: null,
            image: null,
            imageMimeType: null,
            name: 'Name',
            attributes: [],
            media: [
                // {
                //   item: 'https://scx2.b-cdn.net/gfx/news/hires/2018/lion.jpg',
                //   // item: 'https://assets-global.website-files.com/5c38aa850637d1e7198ea850/5f4e173f16b537984687e39e_AAVE%20ARTICLE%20website%20main%201600x800.png',
                //   type: 'image/jpeg',
                // },
            ],
            appId: 'testing123',
        }
        try {
            // authenticate
            const challengeResponse = await generateChallenge(dataAccount.address);
            // namedConsoleLog('challengeResponse', challengeResponse);
            const signature = await signMessage({ message: challengeResponse.data.challenge.text });
            // namedConsoleLog('signature', signature);
            const accessTokens = await authenticate(dataAccount.address, signature.data);
            // namedConsoleLog('accessTokens', accessTokens);

            // comment
            // alert('client')
            const ipfsResult = await ipfsClient.add(JSON.stringify(comment));
            // namedConsoleLog('ipfsResult', ipfsResult);
            const createCommentRequest = {
                profileId: profileIDApp.toHexString(),
                publicationId: publicationID,
                contentURI: 'ipfs://' + ipfsResult.path,
                collectModule: {
                    // timedFeeCollectModule: {
                    //     amount: {
                    //         currency: currencies.enabledModuleCurrencies.map(
                    //             (c: any) => c.address
                    //         )[0],
                    //         value: '0.01',
                    //     },
                    //     recipient: address,
                    //     referralFee: 10.5,
                    // },
                    revertCollectModule: true,
                },
                referenceModule: {
                    followerOnlyReferenceModule: false,
                },
            };
            const result = await createCommentTypedData(createCommentRequest, accessTokens?.data?.authenticate?.accessToken);
            // namedConsoleLog('createCommentTypedData', result);
            const typedData = result.data.createCommentTypedData.typedData;
            const commentSignature = await signTypedData({
                domain: omit(typedData.domain, '__typename'),
                types: omit(typedData.types, '__typename'),
                value: omit(typedData.value, '__typename'),
            });
            namedConsoleLog('commentSignature', commentSignature);
            const { v, r, s } = utils.splitSignature(commentSignature.data);
            const transaction = await write(
                {
                    args: {
                        profileId: typedData.value.profileId,
                        contentURI: typedData.value.contentURI,
                        profileIdPointed: typedData.value.profileIdPointed,
                        pubIdPointed: typedData.value.pubIdPointed,
                        collectModule: typedData.value.collectModule,
                        collectModuleData: typedData.value.collectModuleData,
                        referenceModule: typedData.value.referenceModule,
                        referenceModuleData: typedData.value.referenceModuleData,
                        sig: {
                            v,
                            r,
                            s,
                            deadline: typedData.value.deadline,
                        },
                    }
                });
            // namedConsoleLog('transaction', transaction);
            setIsBlockchainTxPending(true);
            const receipt = await transaction.data.wait();
            // namedConsoleLog('receipt', receipt);
            setIsBlockchainTxPending(false);
        }
        catch (error) {
            namedConsoleLog('clickPostComment error', error);
            setIsBlockchainTxPending(false);
        }
    }

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
                    <Button
                        alignSelf='flex-end'
                        size='sm'
                        mt='4px'
                        onClick={() => clickPostComment()}
                        disabled={!Boolean(dataAccount?.address)}
                    >
                        Post comment
                    </Button>
                    {
                        isBlockchainTxPending || Boolean(dataContractWrite)
                            ?
                            <Skeleton isLoaded={!isBlockchainTxPending} startColor='pink.500' endColor='orange.500' height='20px'>
                                <Text textAlign='center'>Commented</Text>
                            </Skeleton>
                            :
                            null
                    }
                </Flex>
            </Flex>
        </Collapse>
    )
}

export default PublicationCommentEditor;
