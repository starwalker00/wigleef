import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PageContainer from '../components/PageContainer'
import PublicationView from '../components/PublicationView'
import { InfiniteScrollLoading, InfiniteScrollLoaded } from '../components/InfiniteScrollStates';
import InfiniteScroll from 'react-infinite-scroll-component';
import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../lib/apolloClient";
import { prettyJSON } from '../lib/helpers';
import { Container, Stack, Heading, Link, Text, Divider } from '@chakra-ui/react';
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { DEMO_PROFILE_ID } from '../lib/config';
import { BigNumber } from "@ethersproject/bignumber";

const EXPLORE_PUBLICATIONS = `
  query($request: ExplorePublicationRequest!) {
    explorePublications(request: $request) {
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

function Explore() {
  // get profileID from params
  const router = useRouter();
  const profileID = router.query.profileID ?? DEMO_PROFILE_ID;
  // prettyJSON('profileID', profileID);
  const constCurrentProfileID = BigNumber.from(profileID);
  const { loading, error, data, fetchMore } = useQuery(
    gql(EXPLORE_PUBLICATIONS),
    {
      variables: {
        request: { sortCriteria: 'TOP_COMMENTED', limit: 10, cursor: 0 },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const publications = data?.explorePublications?.items || [];
  const havePublication = Boolean(publications.length);
  const totalCount = data?.explorePublications?.pageInfo?.totalCount || 0;
  const haveMorePublication = Boolean(publications.length < totalCount);

  function fetchMorePublications() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = data.explorePublications.pageInfo.next;
    // prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          sortCriteria: 'TOP_COMMENTED',
          limit: 10,
          cursor: pageInfoNext
        },
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        // prettyJSON('prevResult', fetchMoreResult);
        // prettyJSON('fetchMoreResult', fetchMoreResult);
        fetchMoreResult.explorePublications.items = [
          ...prevResult.explorePublications.items,
          ...fetchMoreResult.explorePublications.items
        ];
        // remove eventual duplicates, just in case
        fetchMoreResult.explorePublications.items = [...new Set([...prevResult.explorePublications.items, ...fetchMoreResult.explorePublications.items])]
        return fetchMoreResult;
      }
    });
  }
  return (
    <>
      {/* {console.log(publications)} */}
      <Stack direction='column'>
        <Heading alignSelf={'center'}>Explore</Heading>
        <Text alignSelf={'center'}>{totalCount} publications</Text>
      </Stack>
      {
        error
          ?
          <h1>error</h1>
          :
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
              // style={{ border: '2px solid #eee' }}
              // style={{ width: '100%' }}
              >
                {publications.map((publication) => (
                  <PublicationView key={publication.id} publication={publication} />
                ))}
              </InfiniteScroll>
            </Stack>
          </Container>
      }
    </>
  )
}

Explore.getLayout = function getLayout(page) {
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

export async function getStaticProps(context) {
  const apolloClient = initializeApollo();

  const result = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: { sortCriteria: 'TOP_COMMENTED', limit: 10, cursor: 0 },
    },
  });
  // prettyJSON('explore: result', result.data);

  return addApolloState(apolloClient, {
    props: {},
  });
}

export default Explore
