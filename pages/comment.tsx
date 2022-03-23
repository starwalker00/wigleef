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

const CREATE_COMMENT_TYPED_DATA = `
  mutation($request: CreatePublicCommentRequest!) { 
    createCommentTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CommentWithSig {
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
        profileIdPointed
        pubIdPointed
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

let comment: Metadata =
{
    version: MetadataVersions.one,
    metadata_id: uuidv4(),
    description: 'Description',
    content: 'OAS ✽ ✾ ✿ ❀ ❁ ❃ ❊ ❋ ✣ ✤ 🌹 ❀ ✿ 🌷 💐 ⚜',
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

function Comment() {
    const profileIDApp: ethers.BigNumber = useProfileID();
    const apolloClient = useApolloClient();
    const [isLoading, setIsLoading] = useState(false);
    const [{ data, error, loading }, signMessage] = useSignMessage();
    const [{ data: dataSignTypedData, error: errorSignTypedData, loading: loadingSignTypedData }, signTypedData] = useSignTypedData();
    const [createComment, { called: calledCreateComment, reset: resetCreateComment, data: dataCreate }] = useMutation(gql(CREATE_COMMENT_TYPED_DATA));
    const [{ data: dataSigner, error: errorSigner, loading: loadingSigner }, getSigner] = useSigner();
    const [{ data: dataContractWrite, error: errorContractWrite, loading: loadingContractWrite }, write] = useContractWrite(
        {
            addressOrName: '0xd7B3481De00995046C7850bCe9a5196B7605c367',
            contractInterface: LENS_HUB_ABI,
        },
        'commentWithSig'
    );
    const [{ data: dataAccount, error: errorAccount, loading: loadingAccount }, disconnect] = useAccount();
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
    const createCommentTypedData = (createCommentTypedDataRequest: any, accessTokens: any) => {
        const accessToken = accessTokens?.data?.authenticate?.accessToken;
        return createComment(
            {
                variables: {
                    request: createCommentTypedDataRequest,
                },
                context: { headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' } }
            }
        );
    };

    async function clickComment() {
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
            return ipfsClient.add(JSON.stringify(comment))
        }).then(ipfsResult => {
            prettyJSON('ipfsResult', ipfsResult);
            const createCommentRequest = {
                profileId: profileIDApp.toHexString(),
                // remember it has to be indexed and follow metadata standards to be traceable!
                publicationId: '0x49-0x02',
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
            return createCommentTypedData(createCommentRequest, _accessTokens)
        }).then(response => {
            prettyJSON('createCommentTypedData: ', response);
            typedData = response.data.createCommentTypedData.typedData;
            debugger;
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
        }).then(() => {
            console.log('COMMENT SENT')
        }).catch(error => {
            console.log('COMMENT NOOOOOOOT SENT')
            console.log(error);
        }).finally(() => {
            setIsLoading(false);
        });
    }
    return (
        <section>
            <h2>Comment</h2>
            <p>
                This example adds a property <code>getLayout</code> to your page,
                allowing you to return a React component for the layout. This allows you
                to define the layout on a per-page basis. Since we&apos;re returning a
                function, we can have complex nested layouts if desired.
            </p>
            <p>
                {dataAccount
                    ? <Button isLoading={isLoading} onClick={() => clickComment()} spinner={<BeatLoader size={8} />}>Comment</Button>
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

Comment.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar>
                {page}
            </Sidebar>
        </Layout>
    )
}

export default Comment
