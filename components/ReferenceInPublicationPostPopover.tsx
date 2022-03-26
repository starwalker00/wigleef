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
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
} from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { BiSubdirectoryLeft } from 'react-icons/bi';
import SocialProfileSimple from './SocialProfileSimple';
import PublicationView from './PublicationView';

function ReferenceInPublicationPostPopover({ children, post }) {
    namedConsoleLog('post', post);
    return (
        <>
            <Popover trigger='hover'>
                <PopoverTrigger>
                    {children}
                </PopoverTrigger>
                <Portal>
                    <PopoverContent style={{ zIndex: '9999' }}>
                        <PublicationView publication={post} />
                    </PopoverContent>
                </Portal>
            </Popover>
        </>
    )
}

export default ReferenceInPublicationPostPopover;

// {__typename: 'Profile', id: '0x78', name: 'Sasi', bio: null, location: null, …}
// bio: null
// coverPicture: null
// depatcher: null
// followModule: null
// handle: "sasi.codes"
// id: "0x78"
// location: null
// name: "Sasi"
// ownedBy: "0x01d79BcEaEaaDfb8fD2F2f53005289CFcF483464"
// picture:
// medium: null
// original: {__typename: 'Media', url: 'https://ipfs.infura.io/ipfs/QmXGoeBsAyaFXaz3Z1CDtGWczakhaWPcDbBqCM4YqgkXpw', width: null, height: null, mimeType: null}
// small: null
// __typename: "MediaSet"
// [[Prototype]]: Object
// stats: {__typename: 'ProfileStats', totalFollowers: 0, totalFollowing: 5, totalPosts: 7, totalComments: 2, …}
// twitterUrl: "https://twitter.com/sasicodes"
// website: "https://sasi.codes"
// __typename: "Profile"
