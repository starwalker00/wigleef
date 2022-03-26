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
    Progress,
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

import { ArrowRightIcon } from '@chakra-ui/icons';
import { BiSubdirectoryLeft } from 'react-icons/bi';
import ReferenceInPublicationPopover from './ReferenceInPublicationPopover';
import ReferenceInPublicationPostPopover from './ReferenceInPublicationPostPopover';

function ReferenceInPublication({ mainPost, mainType }) {
    namedConsoleLog('mainPost', mainPost);
    let type = mainPost.__typename.toString().toLowerCase();
    let verb = mainType === 'mainPost' ? 'Comment on' : mainType === 'mirrorOf' ? 'Mirrors' : 'bug';
    let publicationId = mainPost.id.toString().toLowerCase();
    let displayName = mainPost?.profile?.name || mainPost?.profile?.handle;
    let profileId = mainPost?.profile?.id;
    return (
        <>
            <Stack direction='row' spacing={4} alignItems='center' backgroundColor='gray.50'
                px={12} pt={6} pb={2}
            >
                <BiSubdirectoryLeft style={{ transform: 'rotate(180deg)' }} color='gray.600' />
                <Text color='gray.600' fontSize='md'>
                    {verb}{' '}{type}{' '}
                    <NextLink
                        href={{
                            pathname: '/publication/[publicationID]',
                            query: { publicationID: publicationId },
                        }}
                        passHref>
                        <Link fontWeight='semibold'>
                            <ReferenceInPublicationPostPopover post={mainPost}>
                                <span>{publicationId}</span>
                            </ReferenceInPublicationPostPopover>
                        </Link>
                    </NextLink>
                    {' '}by{' '}

                    <NextLink
                        href={{
                            pathname: '/profile/[profileID]',
                            query: { profileID: profileId },
                        }}
                        passHref>

                        <Link fontWeight='semibold'>
                            <ReferenceInPublicationPopover profile={mainPost?.profile}>
                                <span>{displayName}</span>
                            </ReferenceInPublicationPopover>
                        </Link>
                    </NextLink>
                </Text>
            </Stack>
        </>
    )
}


export default ReferenceInPublication;
