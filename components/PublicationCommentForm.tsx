import { useState, useEffect } from 'react';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import {
    Flex,
    Avatar,
    Box, Text, Badge, Divider, Heading, IconButton, Icon, LinkOverlay, LinkBox, Link, Button, Collapse, Portal, Spacer, CloseButton,
    Skeleton,
    Stack, Code
} from '@chakra-ui/react';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Progress
} from '@chakra-ui/react';
import MarkdownEditor from './MarkdownEditor'
import { gql, useQuery } from "@apollo/client";
import { useSignMessage, useSignTypedData, useContractWrite, useSigner, useAccount } from 'wagmi';
import { generateChallenge } from '../lib/apollo/generate-challenge'
import { authenticate } from '../lib/apollo/authenticate'
import { namedConsoleLog, omit, isJwtExpired } from '../lib/helpers';
import { v4 as uuidv4 } from 'uuid';
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { createCommentTypedData } from '../lib/apollo/create-comment-typed-data';
import { ipfsClient } from '../lib/ipfs-client';
import { Metadata, MetadataVersions } from '../lib/metadata'
import { useProfileID, useDispatchProfileID } from "./context/AppContext";
import { LENS_HUB_ABI } from '../lib/abi';
import { ethers, utils, Wallet } from 'ethers';
import NextLink from 'next/link'
import ConnectButtonAndModal from './ConnectButtonAndModal';

function PublicationCommentForm({ isOpenComment, isToggleComment, publicationID }) {
    // app context in-use
    const { profileIDApp, authenticateApp } = useProfileID();
    const dispatch = useDispatchProfileID();
    // namedConsoleLog('authenticateApp', authenticateApp);

    // wagmi hooks
    const [{ data: dataAccount, error: errorAccount, loading: loadingAccount }, disconnect] = useAccount();
    const isWalletConnected = Boolean(dataAccount?.address);
    const [{ data: dataSignMessage, error: errorSignMessage, loading: loadingSignMessage }, signMessage] = useSignMessage();
    const [{ data: dataSignTypedData, error: errorSignTypedData, loading: loadingSignTypedData }, signTypedData] = useSignTypedData();
    const [{ data: dataContractWrite, error: errorContractWrite, loading: loadingContractWrite }, write] = useContractWrite(
        {
            addressOrName: '0xd7B3481De00995046C7850bCe9a5196B7605c367',
            contractInterface: LENS_HUB_ABI,
        },
        'commentWithSig'
    );

    // lens-api status
    const [isLoading, setIsLoading] = useState(false);
    // transaction status
    const [isBlockchainTxPending, setIsBlockchainTxPending] = useState(false);
    // error status
    const [isError, setIsError] = useState(false);
    // reset error status after X milliseconds
    useEffect(() => {
        if (isError) {
            setTimeout(() => {
                setIsError(false);
            }, 5000);
        }
    }, [isError]);

    // markdown editor
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");

    // newly created comment id
    const [newCommentId, setNewCommentId] = useState("");

    // comment template
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

    // authenticate wallet to lens-api
    async function login() {
        console.log('Requesting JWT')
        // authenticate
        const challengeResponse = await generateChallenge(dataAccount.address);
        // namedConsoleLog('challengeResponse', challengeResponse);
        const signature = await signMessage({ message: challengeResponse.data.challenge.text });
        // namedConsoleLog('signature', signature);
        return authenticate(dataAccount.address, signature.data);
    }
    async function clickPostComment() {
        // TODO: migrate to apollo hooks later ?
        // alert('clickComment');
        // namedConsoleLog('dataAccount', dataAccount);
        // namedConsoleLog('errorAccount', errorAccount);
        // namedConsoleLog('loadingAccount', loadingAccount);
        let accessToken;
        // namedConsoleLog('authenticateApp', authenticateApp);
        // request a login access if there is no accessTokens in context or Jwt in context has expired
        setIsLoading(true);
        try {
            setIsError(false);
            // check if connected user has a valid jwt token
            let accessToken;
            if (!authenticateApp?.accessToken || authenticateApp.accessToken.length < 1 || isJwtExpired(authenticateApp.accessToken)) {
                const accessTokens = await login();
                // namedConsoleLog('accessTokens', accessTokens);
                let authenticate = accessTokens?.data?.authenticate;
                dispatch({ type: 'set_appContext', payload: { profileIDApp: profileIDApp, authenticateApp: authenticate } });
                accessToken = authenticate.accessToken;
            }
            else {
                accessToken = authenticateApp.accessToken;
            }
            // namedConsoleLog('accessToken', accessToken);

            // upload to ipfs
            const ipfsResult = await ipfsClient.add(JSON.stringify(comment));
            // namedConsoleLog('ipfsResult', ipfsResult);

            // namedConsoleLog('publicationID', publicationID);
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
            const result = await createCommentTypedData(createCommentRequest, accessToken);
            // namedConsoleLog('createCommentTypedData', result);
            const typedData = result.data.createCommentTypedData.typedData;
            const commentSignature = await signTypedData({
                domain: omit(typedData.domain, '__typename'),
                types: omit(typedData.types, '__typename'),
                value: omit(typedData.value, '__typename'),
            });
            // namedConsoleLog('commentSignature', commentSignature);
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
            namedConsoleLog('transaction', transaction);
            setIsBlockchainTxPending(true);
            const receipt = await transaction.data.wait();
            namedConsoleLog('receipt', receipt);
            setIsBlockchainTxPending(false);
            setIsLoading(false);
            let postId = ethers.BigNumber.from(receipt.logs[0].topics[2]);
            let newProfileCommentId = profileIDApp.toHexString().concat('-').concat(postId.toHexString()).trim();
            namedConsoleLog('newProfileCommentId', newProfileCommentId);
            setNewCommentId(newProfileCommentId);
            console.log('done post ok');
        } catch (error) {
            namedConsoleLog('error', error);
            setIsBlockchainTxPending(false);
            setIsLoading(false);
            setIsError(true);
            console.log('done comment failed');
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
                    backgroundColor='#85FFBD'
                    backgroundImage='linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)'
                    rounded='md'
                    shadow='md'
                    zIndex='2'
                >
                    <CloseButton alignSelf='flex-end' onClick={isToggleComment} size='sm' color='gray.800' />
                    <MarkdownEditor markdownValue={markdownValue} onChange={setMarkdownValue} />
                    {
                        isWalletConnected
                            ?
                            <Stack direction='row' justifyContent='flex-end' padding={4} spacing={4}>
                                <Text visibility='hidden'>Please connect your wallet</Text>
                                <Button mt={4} type="submit"
                                    isActive={!isLoading && !isBlockchainTxPending && !isError}
                                    isDisabled={!(!isLoading && !isBlockchainTxPending && !isError)}
                                    colorScheme='blackAlpha'
                                    onClick={() => clickPostComment()}
                                >
                                    Post comment
                                </Button>
                            </Stack>
                            :
                            <Stack direction='row' justifyContent='flex-end' padding={4} spacing={4}>
                                <Text>Please connect your wallet</Text>
                                <ConnectButtonAndModal showConnected={false} autoFocus={true}
                                    colorScheme='blackAlpha'
                                />
                                <Button isActive={false} isDisabled={true} mt={4} type="submit"
                                    colorScheme='blackAlpha'
                                >
                                    Post comment
                                </Button>
                            </Stack>
                    }
                    {/* <Button
                        colorScheme='blackAlpha'
                        alignSelf='flex-end'
                        size='sm'
                        mt='4px'
                        onClick={() => clickPostComment()}
                        disabled={!Boolean(dataAccount?.address)}
                    >
                        Post comment
                    </Button> */}
                    {
                        // waiting signature and lens-api calls
                        isLoading && !isBlockchainTxPending && (
                            <Stack direction='column' spacing={0}>
                                <Code alignSelf='center' colorScheme='teal'>Loading</Code>
                                <Progress size='lg' isIndeterminate colorScheme='teal' />
                            </Stack>
                        )
                    }
                    {
                        // waiting blockchain write
                        isLoading && isBlockchainTxPending && (
                            <Stack direction='column' spacing={0}>
                                <Code alignSelf='center' colorScheme='orange'>Loading</Code>
                                <Progress size='lg' isIndeterminate colorScheme='orange' />
                            </Stack>
                        )
                    }
                    {
                        // post action errored
                        !isLoading && !isBlockchainTxPending && isError && (
                            <Stack direction='column' spacing={0}>
                                <Code alignSelf='center' colorScheme='red'>Error. Reload page and retry.</Code>
                                <Progress size='lg' value={100} colorScheme='red' />
                            </Stack>
                        )
                    }
                    {
                        // post action completed (has a newPostId gathered from blockchain receipt)
                        !isLoading && !isBlockchainTxPending && !isError && Boolean(newCommentId) && (
                            <Stack direction='column' spacing={0}>
                                <Stack alignSelf='center' direction='row' spacing={0} alignItems='baseline'>
                                    <Code colorScheme='green' m={0} p={0}>Posted !</Code>
                                    <NextLink
                                        href={{
                                            pathname: '/publication/[publicationID]',
                                            query: { publicationID: newCommentId },
                                        }}
                                        passHref
                                    >
                                        <Link m={0} p={0}
                                            textDecoration='underline overline #FF3028'
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'lg',
                                            }}
                                        >
                                            <Code colorScheme='green'>{' '}—{' '}Click here to see it.</Code>
                                        </Link>
                                    </NextLink>
                                </Stack>
                                <Progress size='lg' value={100} colorScheme='green' />
                            </Stack>
                        )
                    }
                    {
                        // waiting for user action before calling
                        !isLoading && !isBlockchainTxPending && !isError && !Boolean(newCommentId) && (
                            <Stack direction='column' spacing={0}>
                                <Code alignSelf='center' colorScheme='green' visibility="hidden" >Waiting</Code>
                                <Progress size='lg' value={0} />
                            </Stack>
                        )
                    }
                </Flex>
            </Flex>
        </Collapse >
    )
}

export default PublicationCommentForm;
