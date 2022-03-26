import { AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import {
    Text,
    Button,
    Flex,
    Box,
    Spacer,
    Spinner,
    Stack,
    Container,
    Code,
    Link
} from '@chakra-ui/react';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Progress
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useProfileID, useDispatchProfileID } from "./context/AppContext";
import { namedConsoleLog, omit, isJwtExpired } from '../lib/helpers';
import { useSignMessage, useSignTypedData, useContractWrite, useSigner, useAccount } from 'wagmi';
import ConnectButtonAndModal from './ConnectButtonAndModal';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { generateChallenge } from '../lib/apollo/generate-challenge';
import { authenticate } from '../lib/apollo/authenticate';
import { ipfsClient } from '../lib/ipfs-client';
import { Metadata, MetadataVersions } from '../lib/metadata'
import { v4 as uuidv4 } from 'uuid';
import { createPostTypedData } from '../lib/apollo/create-post-typed-data';
import { ethers, utils, Wallet } from 'ethers';
import { LENS_HUB_ABI } from '../lib/abi';
import NextLink from 'next/link'

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);
export default function PostForm() {
    // app context in-use
    const { profileIDApp, authenticateApp } = useProfileID();
    const dispatch = useDispatchProfileID();
    // namedConsoleLog('authenticateApp', authenticateApp);

    // wagmi hooks && management
    const [{ data: dataAccount, error: errorAccount, loading: loadingAccount }, disconnect] = useAccount();
    const isWalletConnected = Boolean(dataAccount?.address);
    const [{ data: dataSignMessage, error: errorSignMessage, loading: loadingSignMessage }, signMessage] = useSignMessage();
    const [{ data: dataSignTypedData, error: errorSignTypedData, loading: loadingSignTypedData }, signTypedData] = useSignTypedData();
    const [{ data: dataContractWrite, error: errorContractWrite, loading: loadingContractWrite }, write] = useContractWrite(
        {
            addressOrName: '0xd7B3481De00995046C7850bCe9a5196B7605c367',
            contractInterface: LENS_HUB_ABI,
        },
        'postWithSig'
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

    // markdown editor value
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");

    // newly created post id
    const [newPostId, setNewPostId] = useState("");

    // post template
    let post: Metadata =
    {
        version: MetadataVersions.one,
        metadata_id: uuidv4(),
        description: 'Description',
        // content: 'OAS ✽ ✾ ✿ ❀ ❁ ❃ ❊ ❋ ✣ ✤ 🌹 ❀ ✿ 🌷 💐 ⚜',
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
        namedConsoleLog('dataAccount', dataAccount);
        const challengeResponse = await generateChallenge(dataAccount.address);
        namedConsoleLog('challengeResponse', challengeResponse);
        const signature = await signMessage({ message: challengeResponse.data.challenge.text });
        namedConsoleLog('signature', signature);
        return authenticate(dataAccount.address, signature.data);
    }

    const handleSubmit = async event => {
        event.preventDefault();
        // console.log(event);
        // console.log(event.target.postName.value);
        // console.log(event.target.postDescription.value);
        post.name = event?.target?.postName?.value || 'Name';
        post.description = event?.target?.postDescription?.value || 'Description';
        console.log(post)
        setIsLoading(true);
        try {
            setIsError(false);
            // check if connected user has a valid jwt token
            let accessToken;
            namedConsoleLog('profileIDApp', profileIDApp);
            namedConsoleLog('authenticateApp', authenticateApp);
            // request a login access if there is no accessTokens in context or Jwt in context has expired
            if (!authenticateApp?.accessToken || authenticateApp?.accessToken.length < 1 || isJwtExpired(authenticateApp?.accessToken)) {
                const accessTokens = await login();
                namedConsoleLog('accessTokenslogin', accessTokens);
                let authenticate = accessTokens?.data?.authenticate;
                dispatch({ type: 'set_appContext', payload: { profileIDApp: profileIDApp, authenticateApp: authenticate } });
                accessToken = authenticate.accessToken;
            }
            else {
                accessToken = authenticateApp.accessToken;
            }
            namedConsoleLog('accessToken', accessToken);
            // upload post to ipfs
            const ipfsResult = await ipfsClient.add(JSON.stringify(post));
            namedConsoleLog('ipfsResult', ipfsResult);
            const createPostRequest = {
                profileId: profileIDApp.toHexString(),
                contentURI: 'ipfs://' + ipfsResult.path,
                collectModule: {
                    // feeCollectModule: {
                    //   amount: {
                    //     currency: currencies.enabledModuleCurrencies.map(
                    //       (c: any) => c.address
                    //     )[0],
                    //     value: '0.000001',
                    //   },
                    //   recipient: address,
                    //   referralFee: 10.5,
                    // },
                    revertCollectModule: true,
                },
                referenceModule: {
                    followerOnlyReferenceModule: false,
                },
            };
            const result = await createPostTypedData(createPostRequest, accessToken);
            namedConsoleLog('createPostTypedData', result);
            const typedData = result.data.createPostTypedData.typedData;
            const postSignature = await signTypedData({
                domain: omit(typedData.domain, '__typename'),
                types: omit(typedData.types, '__typename'),
                value: omit(typedData.value, '__typename'),
            });
            namedConsoleLog('postSignature', postSignature);
            const { v, r, s } = utils.splitSignature(postSignature.data);
            const transaction = await write(
                {
                    args: {
                        profileId: typedData.value.profileId,
                        contentURI: typedData.value.contentURI,
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
            let newProfilePostId = profileIDApp.toHexString().concat('-').concat(postId.toHexString()).trim();
            namedConsoleLog('newProfilePostId', newProfilePostId);
            setNewPostId(newProfilePostId);
            console.log('done post ok');
        } catch (error) {
            namedConsoleLog('error', error);
            setIsBlockchainTxPending(false);
            setIsLoading(false);
            setIsError(true);
            console.log('done post failed');
        }
    };
    return (
        <Flex flexDirection='column' alignItems='stretch'>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input id='postName' placeholder="Name of the post." />
                </FormControl>
                <FormControl mt={6}>
                    <FormLabel>Description</FormLabel>
                    <Input id='postDescription' placeholder="Description of the post." />
                </FormControl>
                <FormControl mt={6}>
                    <FormLabel>Content</FormLabel>
                    {// @ts-ignore
                        <MDEditor value={markdownValue} onChange={setMarkdownValue} />
                    }
                </FormControl>
                {
                    isWalletConnected
                        ?
                        <Stack direction='row' justifyContent='flex-end' padding={4} spacing={4}>
                            <Text fontSize='lg' visibility='hidden'>Please connect your wallet</Text>
                            <Button mt={4} type="submit"
                                // isActive={!isLoading && !isBlockchainTxPending && !isError}
                                isDisabled={!(!isLoading && !isBlockchainTxPending && !isError)}
                            >
                                Post
                            </Button>
                        </Stack>
                        :
                        <Stack direction='row' justifyContent='flex-end' alignItems='center' padding={4} spacing={4}>
                            <Text fontSize='lg'>Please connect your wallet</Text>
                            <ConnectButtonAndModal showConnected={false} autoFocus={true} />
                            <Button isActive={false} isDisabled={true} mt={4} type="submit">
                                Post
                            </Button>
                        </Stack>
                }
            </form>
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
                !isLoading && !isBlockchainTxPending && !isError && Boolean(newPostId) && (
                    <Stack direction='column' spacing={0}>
                        <Stack alignSelf='center' direction='row' spacing={0} alignItems='baseline'>
                            <Code colorScheme='green' m={0} p={0}>Posted !</Code>
                            <NextLink
                                href={{
                                    pathname: '/publication/[publicationID]',
                                    query: { publicationID: newPostId },
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
                !isLoading && !isBlockchainTxPending && !isError && !Boolean(newPostId) && (
                    <Stack direction='column' spacing={0}>
                        <Code alignSelf='center' colorScheme='green' visibility="hidden" >Waiting</Code>
                        <Progress size='lg' value={0} />
                    </Stack>
                )
            }
        </Flex>
    )
}


// receipt:::::
// helpers.ts?c67c:6 
// {to: '0xd7B3481De00995046C7850bCe9a5196B7605c367', from: '0x235596F35fdeAc45a59bf38640dD68F19A85dE39', contractAddress: null, transactionIndex: 31, gasUsed: BigNumber, …}
// blockHash: "0xf37a28843cdbd6909d5a89d0cc8b997f881d3b8f1f4b0cf116ba8598d8044c80"
// blockNumber: 25661596
// byzantium: true
// confirmations: 2
// contractAddress: null
// cumulativeGasUsed: BigNumber {_hex: '0x5bfac6', _isBigNumber: true}
// effectiveGasPrice: BigNumber {_hex: '0x59682f8b', _isBigNumber: true}
// events: (2) [{…}, {…}]
// from: "0x235596F35fdeAc45a59bf38640dD68F19A85dE39"
// gasUsed: BigNumber {_hex: '0x02857f', _isBigNumber: true}
// logs: Array(2)
// 0:
// address: "0xd7B3481De00995046C7850bCe9a5196B7605c367"
// blockHash: "0xf37a28843cdbd6909d5a89d0cc8b997f881d3b8f1f4b0cf116ba8598d8044c80"
// blockNumber: 25661596
// data: "0x00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000098dfab2360352d9da122b5f43a4a4fa5d3ce25a300000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000623dc92a0000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d6350646665365062374b41335956363975766131507a34784e38734a5335454643474b38676f657662366f76000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
// logIndex: 154
// topics: Array(3)
// 0: "0xc672c38b4d26c3c978228e99164105280410b144af24dd3ed8e4f9d211d96a50"
// 1: "0x000000000000000000000000000000000000000000000000000000000000004d"
// 2: "0x0000000000000000000000000000000000000000000000000000000000000022"
// length: 3
// [[Prototype]]: Array(0)
// transactionHash: "0x275008d697ac11234cc4722bf1eaaf8bab59a4c4a5201a16e859efb492ef130b"
// transactionIndex: 31
// [[Prototype]]: Object
// 1: {transactionIndex: 31, blockNumber: 25661596, transactionHash: '0x275008d697ac11234cc4722bf1eaaf8bab59a4c4a5201a16e859efb492ef130b', address: '0x0000000000000000000000000000000000001010', topics: Array(4), …}
// length: 2
// [[Prototype]]: Array(0)
// logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000010000000000000000000000000000000000000800000000000000000000100000000004000000000000000000000000000000000000000000000000080000000000000000001030000000000000000000000020000000004000c80000000004000000000200000000000000000000000000000100000000000000000000000000000004000000000000000000005000000000000000000000000000000100040000000080000000000000100000800000000000000000000000000000000000000100001"
// status: 1
// to: "0xd7B3481De00995046C7850bCe9a5196B7605c367"
// transactionHash: "0x275008d697ac11234cc4722bf1eaaf8bab59a4c4a5201a16e859efb492ef130b"
// transactionIndex: 31
// type: 2
// [[Prototype]]: Object