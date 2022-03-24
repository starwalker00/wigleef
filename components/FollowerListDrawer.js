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
import NextLink from 'next/link'
import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { namedConsoleLog } from '../lib/helpers';
import Pluralize from 'react-pluralize';
import { InfiniteScrollLoading, InfiniteScrollLoaded } from '../components/InfiniteScrollStates';

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
  // drawer management hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const [getFollower, { loading: loadingFollower, error: errorFollower, data: dataFollower, fetchMore }] = useLazyQuery(
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
  // namedConsoleLog('dataFollower', dataFollower);
  const followers = dataFollower?.followers?.items || [];
  // namedConsoleLog('followers', followers);
  const haveFollowers = Boolean(followers.length);
  const totalCount = dataFollower?.followers?.pageInfo?.totalCount || 0;
  const haveMoreFollowers = Boolean(followers.length < totalCount);

  // first query
  useEffect(() => {
    // mimic lazy loading
    if (isOpen) {
      getFollower();
    }
  }, [isOpen]);
  // next queries
  function fetchMoreFollowers() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = dataFollower.followers.pageInfo.next;
    // prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          profileId: profileId,
          limit: 10,
          cursor: pageInfoNext
        },
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        // prettyJSON('prevResult', fetchMoreResult);
        // prettyJSON('fetchMoreResult', fetchMoreResult);
        fetchMoreResult.followers.items = [
          ...prevResult.followers.items,
          ...fetchMoreResult.followers.items
        ];
        // remove eventual duplicates, just in case
        fetchMoreResult.followers.items = [...new Set([...prevResult.followers.items, ...fetchMoreResult.followers.items])]
        return fetchMoreResult;
      }
    });
  }

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
            <Pluralize singular={'follower'} plural={'followers'} zero={'no followers'} count={totalCount} />
            .
          </DrawerHeader>

          <DrawerBody>
            <Table size='xs'>
              <Thead>
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
                    <NextLink
                      key={index}
                      href={{
                        pathname: '/profile/[profileID]',
                        query: { profileID: item?.wallet?.defaultProfile?.id },
                      }}
                      passHref
                    >
                      <Tr
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl',
                          cursor: 'pointer'
                        }}
                        onClick={onClose}
                      >
                        <Td><Avatar size="sm" name={item?.wallet?.defaultProfile?.name || item?.wallet?.defaultProfile?.handle} src={item?.wallet?.defaultProfile?.picture} /></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.name}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.handle}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.id}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.wallet?.defaultProfile?.ownedBy}</Text></Td>
                      </Tr>
                    </NextLink>
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
            {
              !haveFollowers && loadingFollower ? (
                <InfiniteScrollLoading />
              ) : errorFollower ? (
                <p>An error has occurred.</p>
              ) : haveMoreFollowers ? (
                <Stack><Button size='sm' onClick={fetchMoreFollowers}>Fetch more</Button></Stack>
              ) : (
                <InfiniteScrollLoaded />
              )
            }
          </DrawerBody>

          <DrawerFooter>
            <Button onClick={onClose}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
