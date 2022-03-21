import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import {
    Text,
    Button,
    Flex,
    Box,
    Spacer,
    Spinner,
} from '@chakra-ui/react';
import { BeatLoader } from 'react-spinners';
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import { ethers, utils, Wallet } from 'ethers';
import { LENS_HUB_ABI } from '../lib/abi';

import { Metadata, MetadataVersions } from '../lib/metadata'
import { v4 as uuidv4 } from 'uuid';
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { useState, useEffect } from 'react';
import { prettyJSON, omit } from '../lib/helpers';

import { gql, useApolloClient, useMutation } from "@apollo/client";

import { useSignMessage, useSignTypedData, useContractWrite, useSigner, useAccount } from 'wagmi';

import { useProfileID } from "../components/context/AppContext";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

// authentication
const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;
const AUTHENTICATION = `
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

// post
const CREATE_POST_TYPED_DATA = `
  mutation($request: CreatePublicPostRequest!) { 
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleData
        referenceModule
        referenceModuleData
      }
    }
  }
}
`;

let ipfsClient: IPFSHTTPClient | undefined;
try {
    ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        // headers: {
        //     Authorization: 'Basic ' + 'project' + ':' + 'secret'
        // }
    });
    // prettyJSON(ipfsClient);
} catch (error) {
    console.error("IPFS error ", error);
    ipfsClient = undefined;
}

function Post() {
    const profileIDApp: ethers.BigNumber = useProfileID();
    const apolloClient = useApolloClient();
    const [isLoading, setIsLoading] = useState(false);
    const [{ data, error, loading }, signMessage] = useSignMessage();
    const [{ data: dataSignTypedData, error: errorSignTypedData, loading: loadingSignTypedData }, signTypedData] = useSignTypedData();
    const [createPost, { called: calledCreatePost, reset: resetCreatePost, data: dataCreate }] = useMutation(gql(CREATE_POST_TYPED_DATA));
    const [{ data: dataSigner, error: errorSigner, loading: loadingSigner }, getSigner] = useSigner();
    const [{ data: dataContractWrite, error: errorContractWrite, loading: loadingContractWrite }, write] = useContractWrite(
        {
            addressOrName: '0xd7B3481De00995046C7850bCe9a5196B7605c367',
            contractInterface: LENS_HUB_ABI,
        },
        'postWithSig'
    );
    const [{ data: dataAccount, error: errorAccount, loading: loadingAccount }, disconnect] = useAccount();
    const [markdownValue, setMarkdownValue] = useState("**Hello world!!!**");

    //auth 
    const generateChallenge = (address: string) => {
        return apolloClient.query({
            query: gql(GET_CHALLENGE),
            variables: {
                request: {
                    address,
                },
            },
        });
    };
    const authenticate = (address: string, signature: string) => {
        return apolloClient.mutate({
            mutation: gql(AUTHENTICATION),
            variables: {
                request: {
                    address,
                    signature,
                },
            },
        });
    };

    //post
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
    const createPostTypedData = (createPostTypedDataRequest: any, accessTokens: any) => {
        const accessToken = accessTokens?.data?.authenticate?.accessToken;
        return createPost(
            {
                variables: {
                    request: createPostTypedDataRequest,
                },
                context: { headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' } }
            }
        );
    };

    async function clickPost() {
        setIsLoading(true);
        var typedData;
        var _accessTokens;
        generateChallenge(dataAccount.address).then(challengeResponse => {
            return signMessage({ message: challengeResponse.data.challenge.text });
        }).then(signature => {
            prettyJSON('signature', signature)
            return authenticate(dataAccount.address, signature.data);
        }).then(accessTokens => {
            prettyJSON('login: result', accessTokens.data);
            _accessTokens = accessTokens;
            return ipfsClient.add(JSON.stringify(post))
        }).then(ipfsResult => {
            prettyJSON('ipfsResult', ipfsResult);
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
            return createPostTypedData(createPostRequest, _accessTokens)
        }).then(response => {
            prettyJSON('createPostTypedData: ', response);
            typedData = response.data.createPostTypedData.typedData;
            return signTypedData({
                domain: omit(typedData.domain, '__typename'),
                types: omit(typedData.types, '__typename'),
                value: omit(typedData.value, '__typename'),
            });
        }).then(dataSignTypedData => {
            prettyJSON('signTypedData: ', dataSignTypedData);
            const { v, r, s } = utils.splitSignature(dataSignTypedData.data);
            // lensHub.postWithSig({
            return write(
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
        }).then(() => {
            console.log('POST SENT')
        }).catch(error => {
            console.log('POST NOOOOOOOT SENT')
            console.log(error);
        }).finally(() => {
            setIsLoading(false);
        });
    }
    return (
        <section>
            <h2>Post</h2>
            <p>
                This example adds a property <code>getLayout</code> to your page,
                allowing you to return a React component for the layout. This allows you
                to define the layout on a per-page basis. Since we&apos;re returning a
                function, we can have complex nested layouts if desired.
            </p>
            <div>
                {// @ts-ignore
                    <MDEditor value={markdownValue} onChange={setMarkdownValue} />
                }
            </div>
            <p>
                {dataAccount
                    ? <Button isLoading={isLoading} onClick={() => clickPost()} spinner={<BeatLoader size={8} />}>Post</Button>
                    : <Text>No account connected</Text>
                }
            </p>
            <p>
                <span>
                    {!ipfsClient && (
                        <span>Oh oh, Not connected to IPFS. Checkout out the logs for errors</span>
                    )}
                </span>
            </p>
        </section>
    )
}

Post.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar />
            {page}
        </Layout>
    )
}

export default Post
