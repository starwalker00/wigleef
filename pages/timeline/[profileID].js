import Layout from '../../components/layout'
import Sidebar from '../../components/sidebar'
import PublicationView from '../../components/PublicationView'
import PageContainer from '../../components/PageContainer'

import {
  Text,
  Button,
  Flex,
  Box,
  Spacer,
  Stack,
  Select,
  Container,
  Center,
  Spinner,
  Heading,
  Link,
  Divider
} from '@chakra-ui/react';
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import NextLink from 'next/link'

import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import { namedConsoleLog, prettyJSON } from '../../lib/helpers';
import { BigNumber } from "@ethersproject/bignumber";
import { useRouter } from 'next/router'
import { DEMO_PROFILE_ID } from '../../lib/config';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProfileTab from '../../components/ProfileTab';
import Pluralize from 'react-pluralize'
import SocialProfileWithImage from '../../components/SocialProfileWithImage';
import { InfiniteScrollLoading, InfiniteScrollLoaded } from '../../components/InfiniteScrollStates';

const GET_TIMELINE = `
  query($request: TimelineRequest!) {
    timeline(request: $request) {
      items {
        __typename 
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
        ... on Mirror {
          ...MirrorFields
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }

  fragment MediaFields on Media {
    url
    width
    height
    mimeType
  }

  fragment ProfileFields on Profile {
    id
    name
    bio
    location
    website
    twitter
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
          ...MediaFields
        }
        small {
          ...MediaFields
        }
        medium {
          ...MediaFields
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
          ...MediaFields
        }
        small {
         ...MediaFields
        }
        medium {
          ...MediaFields
        }
      }
    }
    ownedBy
    depatcher {
      address
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

  fragment PublicationStatsFields on PublicationStats { 
    totalAmountOfMirrors
    totalAmountOfCollects
    totalAmountOfComments
  }

  fragment MetadataOutputFields on MetadataOutput {
    name
    description
    content
    media {
      original {
        ...MediaFields
      }
      small {
        ...MediaFields
      }
      medium {
        ...MediaFields
      }
    }
    attributes {
      displayType
      traitType
      value
    }
  }

  fragment Erc20Fields on Erc20 {
    name
    symbol
    decimals
    address
  }

  fragment CollectModuleFields on CollectModule {
    __typename
    ... on FreeCollectModuleSettings {
      type
    }
    ... on FeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedTimedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
    ... on RevertCollectModuleSettings {
      type
    }
    ... on TimedFeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
  }

  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
    collectedBy {
      ...WalletFields
    }
  }

  fragment MirrorBaseFields on Mirror {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
  }

  fragment MirrorFields on Mirror {
    ...MirrorBaseFields
    mirrorOf {
     ... on Post {
        ...PostFields          
     }
     ... on Comment {
        ...CommentFields          
     }
    }
  }

  fragment CommentBaseFields on Comment {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
    collectedBy {
      ...WalletFields
    }
  }

  fragment CommentFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
        ...MirrorBaseFields
        mirrorOf {
          ... on Post {
             ...PostFields          
          }
          ... on Comment {
             ...CommentMirrorOfFields        
          }
        }
      }
    }
  }

  fragment CommentMirrorOfFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
         ...MirrorBaseFields
      }
    }
  }

	fragment WalletFields on Wallet {
   address,
   defaultProfile {
    ...ProfileFields
   }
	}
`;

function Timeline() {
  // get profileID from params
  const router = useRouter();
  // demo profile needed because profileID is undefined on first render
  // https://www.joshwcomeau.com/react/the-perils-of-rehydration/
  const profileID = router.query.profileID ?? DEMO_PROFILE_ID;
  // prettyJSON('profileID', profileID);
  const constCurrentProfileID = BigNumber.from(profileID);

  // no authentication is needed yet to get a user timeline
  const { loading, error, data, fetchMore } = useQuery(
    gql(GET_TIMELINE),
    {
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          limit: 10, cursor: 0
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  namedConsoleLog('data', data);
  const publications = data?.timeline?.items || [];
  const havePublication = Boolean(publications.length);
  const totalCount = data?.timeline?.pageInfo?.totalCount || 0;
  const haveMorePublication = Boolean(publications.length < totalCount);

  function fetchMorePublications() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = data.timeline.pageInfo.next;
    // prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          limit: 10,
          cursor: pageInfoNext
        },
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        // prettyJSON('prevResult', fetchMoreResult);
        // prettyJSON('fetchMoreResult', fetchMoreResult);
        fetchMoreResult.timeline.items = [
          ...prevResult.timeline.items,
          ...fetchMoreResult.timeline.items
        ];
        // remove eventual duplicates, just in case
        fetchMoreResult.timeline.items = [...new Set([...prevResult.timeline.items, ...fetchMoreResult.timeline.items])]
        return fetchMoreResult;
      }
    });
  }
  return (
    <>
      {/* {console.log(publications)} */}
      <Stack direction='column'>
        <Heading>Timeline of{' '}
          <NextLink
            href={{
              pathname: '/profile/[profileID]',
              query: { profileID: constCurrentProfileID.toHexString() },
            }}
            passHref>
            <Link>
              <Text as='span'
                _hover={{
                  cursor: 'pointer',
                  backgroundColor: 'gray.100'
                }}
              >
                {constCurrentProfileID.toHexString()}
              </Text>
            </Link>
          </NextLink>
        </Heading>
        <Text alignSelf={'center'}>{totalCount} publications</Text>
      </Stack>
      {
        !havePublication && loading ? (
          // <Skeleton height='20px'>loading</Skeleton>
          <Container
            display='flex'
            flexDirection='column'
            // maxWidth={{ base: '100%', md: '80% ' }}
            width={{ base: '100%', md: '80% ' }}
          >{
              Array.from({ length: 20 }, (x, i) => i).map((val) =>
                <Box key={val} alignItems='stretch' display="flex" flexDirection='column' padding='6' boxShadow='lg' bg='white'>
                  <SkeletonCircle size='10' />
                  <SkeletonText width={'full'} mt='4' noOfLines={4} spacing='4' />
                </Box>)
            }</Container>
        ) : error ? (
          <p>An error has occurred.</p>
        ) : !havePublication ? (
          <p>Publication not found</p>
        ) : (
          <Container
          // border='2px solid blue'
          >
            <Stack
              // border='2px solid green'
              direction='column'
            // justifyContent='space-around'
            // alignItems='stretch'
            >
              <Divider py={4} />
              <InfiniteScroll
                dataLength={publications.length}
                next={fetchMorePublications}
                hasMore={haveMorePublication}
                loader={<InfiniteScrollLoading />}
                endMessage={<InfiniteScrollLoaded />}
              >
                {publications.map((publication) => (
                  <PublicationView key={publication.id} publication={publication} />
                ))}
              </InfiniteScroll>
            </Stack>
          </Container>
        )
      }
      {/* {
        error
          ?
          <h1>error</h1>
          :
          <Container
            display='flex'
            flexDirection='column'
            // maxWidth={{ base: '100%', md: '80% ' }}
            width={{ base: '100%', md: '80% ' }}
          >
            <InfiniteScroll
              dataLength={publications.length}
              next={fetchMorePublications}
              hasMore={haveMorePublication}
              loader={<InfiniteScrollLoading />}
              endMessage={<InfiniteScrollLoaded />}
            >
              {publications.map((publication) => (
                <PublicationView key={publication.id} publication={publication} />
              ))}
            </InfiniteScroll>
          </Container>
      } */}
      {/* no authentication is needed yet */}
      {/* {
        <Container
          display='flex'
          flexDirection='column'
          // maxWidth={{ base: '100%', md: '80% ' }}
          width={{ base: '100%', md: '80% ' }}
        >
          <Text>Please connect your account to see your timeline</Text>
          <ConnectButtonAndModal showConnected={false} />
        </Container>
      } */}
    </>
  )
}

Timeline.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar>
        <PageContainer>
          {page}
        </PageContainer>
      </Sidebar>
    </Layout>
  )
}

export default Timeline
