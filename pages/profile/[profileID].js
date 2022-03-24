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
  Spinner
} from '@chakra-ui/react';
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import { namedConsoleLog, prettyJSON } from '../../lib/helpers';
import { BigNumber } from "@ethersproject/bignumber";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DEMO_PROFILE_ID } from '../../lib/config';
import InfiniteScroll from 'react-infinite-scroll-component';

const GET_PUBLICATIONS = `
  query($request: PublicationsQueryRequest!) {
    publications(request: $request) {
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
    mimeType
  }

  fragment ProfileFields on Profile {
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
    ... on EmptyCollectModuleSettings {
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
`;

function Profile() {
  // get profileID from params
  const router = useRouter();
  // demo profile needed because profileID is undefined on first render
  // https://www.joshwcomeau.com/react/the-perils-of-rehydration/
  const profileID = router.query.profileID ?? DEMO_PROFILE_ID;
  // prettyJSON('profileID', profileID);
  const constCurrentProfileID = BigNumber.from(profileID);

  // fetch publications of profileID
  const { loading: loadingPublication, error, data, fetchMore, refetch } = useQuery(
    gql(GET_PUBLICATIONS),
    {
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10
        },
      },
      notifyOnNetworkStatusChange: true
    });
  // prettyJSON('publications', publications);
  const publications = data?.publications?.items || [];
  const havePublication = Boolean(publications.length);
  const totalCount = data?.publications?.pageInfo?.totalCount || 0;
  const haveMorePublication = Boolean(publications.length < totalCount);
  namedConsoleLog('data?.publications', data?.publications)

  function fetchMorePublications() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = data.publications.pageInfo.next;
    prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
          limit: 10,
          cursor: pageInfoNext
        },
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        namedConsoleLog('prevResult', prevResult);
        namedConsoleLog('fetchMoreResult', fetchMoreResult);
        fetchMoreResult.publications.items = [
          ...prevResult.publications.items,
          ...fetchMoreResult.publications.items
        ];
        // remove eventual duplicates, just in case
        fetchMoreResult.publications.items = [...new Set([...prevResult.publications.items, ...fetchMoreResult.publications.items])]
        return fetchMoreResult;
      }
    });
  }
  return (
    <section>
      <Tabs isFitted isLazy lazyBehavior="keepMounted">
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <>
              {
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
                    <p>{totalCount} publications</p>
                    <InfiniteScroll
                      dataLength={publications.length}
                      next={fetchMorePublications}
                      hasMore={haveMorePublication}
                      loader={
                        <Center overflow='hidden'>
                          <Spinner
                            thickness='4px'
                            speed='0.65s'
                            size='md' />
                        </Center>
                      }
                      endMessage={<h4>Nothing more to show</h4>}
                    >
                      {publications.map((publication) => (
                        <PublicationView key={publication.id} publication={publication} />
                      ))}
                    </InfiniteScroll>
                  </Container>
              }
            </>
          </TabPanel >
          <TabPanel>
            <p>three!</p>
          </TabPanel>
        </TabPanels >
      </Tabs >
      {/* {console.log(publications)} */}
      < h1 > profile / [id]</h1 >
    </section >
  )
}

Profile.getLayout = function getLayout(page) {
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

// TODO? : use static generation on useful pages

// export async function getStaticProps({params}) {
//   prettyJSON('params', params);
//   const apolloClient = initializeApollo();

//   const constCurrentProfileID = ethers.BigNumber.from(params.profileID);
//   const result = await apolloClient.query({
//     query: gql(GET_PUBLICATIONS),
//     variables: {
//       request: {
//         profileId: constCurrentProfileID.toHexString(),
//         publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
//       },
//     },
//   });
//   prettyJSON(`GET_PUBLICATIONS OF PROFILE ID ${params.profileID}`, result);
//   return addApolloState(apolloClient, {
//     props: { },
//   });
// }

// export async function getStaticPaths() {
//   const paths = []
//   return {paths, fallback: true }
// }

export default Profile
