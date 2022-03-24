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

const GET_FOLLOWING = `
  query($request: FollowingRequest!) {
    following(request: $request) { 
			    items {
            profile {
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
                    width
                    height
                    mimeType
                  }
                  medium {
                    url
                    width
                    height
                    mimeType
                  }
                  small {
                    url
                    width
                    height
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
                    width
                    height
                    mimeType
                  }
                  small {
                    width
                    url
                    height
                    mimeType
                  }
                  medium {
                    url
                    width
                    height
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
          totalAmountOfTimesFollowing
        }
       pageInfo {
          prev
          next
          totalCount
       }
		}
  }
`;

export default function FollowingListDrawer({ walletAddress }) {
  // drawer management hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const [getFollowing, { loading: loadingFollowing, error: errorFollowing, data: dataFollowing, fetchMore }] = useLazyQuery(
    gql(GET_FOLLOWING),
    {
      variables: {
        request: {
          address: walletAddress,
          limit: 10,
        },
      },
      notifyOnNetworkStatusChange: true
    },
  );
  // namedConsoleLog('dataFollowing', dataFollowing);
  const following = dataFollowing?.following?.items || [];
  // namedConsoleLog('following', following);
  const haveFollowing = Boolean(following.length);
  const totalCount = dataFollowing?.following?.pageInfo?.totalCount || 0;
  const haveMoreFollowing = Boolean(following.length < totalCount);

  // first query
  useEffect(() => {
    // mimic lazy loading
    if (isOpen) {
      getFollowing();
    }
  }, [isOpen]);
  // next queries
  function fetchMoreFollowing() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = dataFollowing.following.pageInfo.next;
    // prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          address: walletAddress,
          limit: 10,
          cursor: pageInfoNext
        },
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        // prettyJSON('prevResult', fetchMoreResult);
        // prettyJSON('fetchMoreResult', fetchMoreResult);
        fetchMoreResult.following.items = [
          ...prevResult.following.items,
          ...fetchMoreResult.following.items
        ];
        // remove eventual duplicates, just in case
        fetchMoreResult.following.items = [...new Set([...prevResult.following.items, ...fetchMoreResult.following.items])]
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
            <Pluralize singular={'profile is'} plural={'profiles are'} zero={'No profiles are'} count={totalCount} />
            {' '}following {walletAddress}
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
                  following?.map((item, index) => (
                    <NextLink
                      key={index}
                      href={{
                        pathname: '/profile/[profileID]',
                        query: { profileID: item?.profile?.id },
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
                        <Td><Avatar size="sm" name={item?.profile?.name || item?.profile?.handle} src={item?.profile?.picture} /></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.profile?.name}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.profile?.handle}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.profile?.id}</Text></Td>
                        <Td><Text fontSize='sm' ml="4">{item?.profile?.ownedBy}</Text></Td>
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
              !haveFollowing && loadingFollowing ? (
                <InfiniteScrollLoading />
              ) : errorFollowing ? (
                <p>An error has occurred.</p>
              ) : haveMoreFollowing ? (
                <Stack><Button size='sm' onClick={fetchMoreFollowing}>Fetch more</Button></Stack>
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
