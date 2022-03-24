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
  const [getFollowing, { loading: loadingFollowing, error: errorFollowing, data: dataFollowing }] = useLazyQuery(
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

  // first query
  useEffect(() => {
    getFollowing();
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
            <Pluralize singular={'profile is'} plural={'profiles are'} zero={'No profiles'} count={following.length} />
            {' '}following {walletAddress}
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
                  following?.map((item, index) => (
                    <Tr key={index}>
                      <Td><Avatar size="sm" name={item?.profile?.name || item?.profile?.handle} src={item?.profile?.picture} /></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.profile?.name}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.profile?.handle}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.profile?.id}</Text></Td>
                      <Td><Text fontSize='sm' ml="4">{item?.profile?.ownedBy}</Text></Td>
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
