import {
  Heading,
  Avatar,
  Box,
  Center,
  Image,
  Flex,
  Text,
  Stack,
  Button,
  useColorModeValue,
  Link,
  Spacer,
  Input,
  useDisclosure
} from '@chakra-ui/react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { namedConsoleLog } from '../lib/helpers';
import Pluralize from 'react-pluralize';

const GET_FOLLOWERS = `
  query($request: FollowersRequest!) {
    followers(request: $request) { 
	   items {
        wallet {
          address
          defaultProfile {
            id
            name
            bio
            location
            website
            twitterUrl
            handle
            picture {
              ... on NftImage {
                contractAddress
                tokenId
                uri
                verified
              }
              ... on MediaSet {
                original {
                  url
                  mimeType
                }
              }
            }
            coverPicture {
              ... on NftImage {
                contractAddress
                tokenId
                uri
                verified
              }
              ... on MediaSet {
                original {
                  url
                  mimeType
                }
              }
            }
            ownedBy
            depatcher {
              address
              canUseRelay
            }
            stats {
              totalFollowers
              totalFollowing
              totalPosts
              totalComments
              totalMirrors
              totalPublications
              totalCollects
            }
            followModule {
              ... on FeeFollowModuleSettings {
                type
                contractAddress
                amount {
                  asset {
                    name
                    symbol
                    decimals
                    address
                  }
                  value
                }
                recipient
              }
            }
          }
        }
        totalAmountOfTimesFollowed
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

export default function FollowerListDrawer({ profileString, profileId }) {
  const [getFollower, { loading: loadingFollower, error: errorFollower, data: dataFollower }] = useLazyQuery(
    gql(GET_FOLLOWERS),
    {
      variables: {
        request: {
          profileId: profileId,
          limit: 10,
        },
      },
      notifyOnNetworkStatusChange: true
    },
  );
  namedConsoleLog('dataFollower', dataFollower);
  const followers = dataFollower?.followers?.items || [];
  namedConsoleLog('followers', followers);

  // first query
  useEffect(() => {
    getFollower();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <>
      <Button size='xs' variant='outline' ref={btnRef} onClick={onOpen}>
        List
      </Button>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size={'xl'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {profileString} — {profileId}
            {' '}has{' '}
            <Pluralize singular={'follower'} plural={'followers'} zero={'no followers'} count={followers.length} />
            .
          </DrawerHeader>

          <DrawerBody>
            <Table>
              <Thead textAlign='center !important'>
                <Tr>
                  <Th></Th>
                  <Th>name</Th>
                  <Th>handle</Th>
                  <Th>id</Th>
                  <Th>owner</Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  followers?.map((item, index) => (
                    <Tr key={index}>
                      <Td><Avatar size="sm" name={item?.wallet?.defaultProfile?.name || item?.wallet?.defaultProfile?.handle} src={item?.wallet?.defaultProfile?.picture} /></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.name}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.handle}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.id}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.ownedBy}</Text></Td>
                    </Tr>
                  ))
                }
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th></Th>
                  <Th></Th>
                  <Th></Th>
                  <Th></Th>
                  <Th></Th>
                </Tr>
              </Tfoot>
            </Table>
          </DrawerBody>

          <DrawerFooter>
            <Button onClick={onClose}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
