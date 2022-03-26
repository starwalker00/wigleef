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
import { namedConsoleLog, omit, isJwtExpired, isaValidHandleFormat } from '../lib/helpers';
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
import { gql, useApolloClient, useMutation } from "@apollo/client";
import { pollUntilIndexed } from '../lib/apollo/has-transaction-been-indexed';

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);
const CREATE_PROFILE = `
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
			__typename
    }
 }
`;

export default function CreateProfileForm() {
    // app context in-use
    const { profileIDApp, authenticateApp } = useProfileID();
    const dispatch = useDispatchProfileID();
    // namedConsoleLog('authenticateApp', authenticateApp);

    const [createProfile, { called: calledCreateProfile, error: errorCreateProfile, reset: resetCreateProfile, data: dataCreateProfile }] = useMutation(gql(CREATE_PROFILE));

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
                setErrorMessage('');
            }, 5000);
        }
    }, [isError]);

    // markdown editor value
    // const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");
    // handle value
    const [profileHandleValue, setProfileHandleValue] = useState('');
    // form validation
    const [isFormError, setIsFormError] = useState(false);
    useEffect(() => { // called on every name or image URI change
        const timer = setTimeout(() => { // avoid bouncing data fields 
            setIsFormError(!isaValidHandleFormat(profileHandleValue)) // form validation
        }, 500)
        return () => clearTimeout(timer)
    }, [profileHandleValue])

    // error message
    const [errorMessage, setErrorMessage] = useState('');
    // newly created profile id
    const [newProfileId, setNewProfileId] = useState("");

    // profile template
    let profile = {
        handle: 'haee3455rrttr22',
        profilePictureUri: 'string',
        followNFTURI: 'string'
    };
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

    const handleSubmit = async event => {
        event.preventDefault();
        // console.log(event);
        console.log(event.target.profileHandle.value);
        console.log(event.target.profilePictureUri.value);
        profile.handle = event?.target?.profileHandle?.value || 'Name';
        profile.profilePictureUri = event?.target?.profilePictureUri?.value || 'Description';
        console.log(profile)
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
                // namedConsoleLog('accessTokens', accessTokens);
                let authenticate = accessTokens?.data?.authenticate;
                dispatch({ type: 'set_appContext', payload: { profileIDApp: profileIDApp, authenticateApp: authenticate } });
                accessToken = authenticate.accessToken;
            }
            else {
                accessToken = authenticateApp.accessToken;
            }
            namedConsoleLog('accessToken', accessToken);
            const createProfileResult = await createProfile(
                {
                    variables: {
                        request: profile,
                    },
                    context: { headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' } }
                },
            );
            namedConsoleLog('createProfileResult', createProfileResult);
            if (createProfileResult.data.createProfile.reason == 'HANDLE_TAKEN') {
                throw ('HANDLE_TAKEN');
            }
            // upload post to ipfs
            // const ipfsResult = await ipfsClient.add(JSON.stringify(post));
            // namedConsoleLog('ipfsResult', ipfsResult);

            console.log('create profile: poll until indexed');
            setIsBlockchainTxPending(true);
            const result = await pollUntilIndexed(createProfileResult.data.createProfile.txHash, accessToken);
            console.log('create profile: profile has been indexed', result);
            const logs = result.txReceipt.logs;
            console.log('create profile: logs', logs);
            const topicId = utils.id(
                'ProfileCreated(uint256,address,address,string,string,address,bytes,string,uint256)'
            );
            console.log('topicid we care about', topicId);
            const profileCreatedLog = logs.find((l: any) => l.topics[0] === topicId);
            console.log('profile created log', profileCreatedLog);
            let profileCreatedEventLog = profileCreatedLog.topics;
            console.log('profile created event logs', profileCreatedEventLog);
            const profileId = utils.defaultAbiCoder.decode(['uint256'], profileCreatedEventLog[1])[0];
            console.log('profile id', ethers.BigNumber.from(profileId).toHexString());
            setNewProfileId(ethers.BigNumber.from(profileId).toHexString());
            // set new profile id to context
            dispatch({ type: 'set_appContext', payload: { profileIDApp: ethers.BigNumber.from(profileId), authenticateApp: null } });
            namedConsoleLog('profileIDApp', profileIDApp);
            setIsBlockchainTxPending(false);
            setIsLoading(false);
            console.log('done create profile ok');
        } catch (error) {
            namedConsoleLog('error', error);
            namedConsoleLog('errorCreateProfile', errorCreateProfile);
            setIsBlockchainTxPending(false);
            setIsLoading(false);
            setIsError(true);
            if (error === 'HANDLE_TAKEN') { setErrorMessage('Name is already taken.'); };
            if (error.toString().includes('InvalidSignature')) { setErrorMessage('Invalid signature. Please reload the page and retry.'); };
            console.log('done create profile failed');
        }
    };
    return (
        <Box my={4} textAlign="left">
            <form onSubmit={handleSubmit}>
                <FormControl isRequired isInvalid={isFormError}>
                    <FormLabel>Your name</FormLabel>
                    <Input id='profileHandle' placeholder="johndoe" onChange={(e) => setProfileHandleValue(e.target.value)} />
                    {!isFormError ? (
                        <FormHelperText color='gray.500'>
                            Must be one unique word, Latin lowercase alphabet characters, or digits from 0 to 9.<br />
                            For instance : &lsquo;jackie&lsquo;, &lsquo;johndeere29&lsquo;, &lsquo;r0b0t&lsquo;.
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>
                            Must be one unique word, Latin lowercase alphabet characters, or digits from 0 to 9.<br />
                            For instance : &lsquo;jackie&lsquo;, &lsquo;johndeere29&lsquo;, &lsquo;r0b0t&lsquo;.
                        </FormErrorMessage>
                    )}
                </FormControl>
                <FormControl mt={6}>
                    <FormLabel>URL of a profile picture</FormLabel>
                    <Input id='profilePictureUri' placeholder="https://avatars.dicebear.com/api/personas/hjhgghjgg.svg" />
                </FormControl>
                {/* <FormControl mt={6}>
                    <FormLabel>Content</FormLabel>
                    {// @ts-ignore
                        <MDEditor value={markdownValue} onChange={setMarkdownValue} />
                    }
                </FormControl> */}
                {
                    isWalletConnected
                        ?
                        <Stack direction='row' justifyContent='flex-end' padding={4} spacing={4}>
                            <Text visibility='hidden'>Please connect your wallet</Text>
                            <Button mt={4} type="submit"
                                isActive={!isLoading && !isBlockchainTxPending && !isError}
                                isDisabled={!(!isLoading && !isBlockchainTxPending && !isError)}
                            >
                                Create
                            </Button>
                        </Stack>
                        :
                        <Stack direction='row' justifyContent='flex-end' padding={4} spacing={4}>
                            <Text>Please connect your wallet</Text>
                            <ConnectButtonAndModal showConnected={false} autoFocus={true} />
                            <Button isActive={false} isDisabled={true} mt={4} type="submit">
                                Create
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
                        {
                            errorMessage.length > 0
                                ? <Code alignSelf='center' colorScheme='red'>Error. {errorMessage}</Code>
                                : <Code alignSelf='center' colorScheme='red'>Error. Reload page and retry.</Code>
                        }
                        <Progress size='lg' value={100} colorScheme='red' />
                    </Stack>
                )
            }
            {
                // post action completed (has a newPostId gathered from blockchain receipt)
                !isLoading && !isBlockchainTxPending && !isError && Boolean(newProfileId) && (
                    <Stack direction='column' spacing={0}>
                        <Stack alignSelf='center' direction='row' spacing={0} alignItems='baseline'>
                            <Code colorScheme='green' m={0} p={0}>Profile created !</Code>
                            <NextLink
                                href={{
                                    pathname: '/profile/[profileID]',
                                    query: { profileID: newProfileId },
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
                !isLoading && !isBlockchainTxPending && !isError && !Boolean(newProfileId) && (
                    <Stack direction='column' spacing={0}>
                        <Code alignSelf='center' colorScheme='green' visibility="hidden">Waiting</Code>
                        <Progress size='lg' value={0} />
                    </Stack>
                )
            }
        </Box >
    )
}
