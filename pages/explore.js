import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PageContainer from '../components/PageContainer'
import PublicationView from '../components/PublicationView'
import InfiniteScroll from 'react-infinite-scroll-component';
import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../lib/apolloClient";
import { prettyJSON } from '../lib/helpers';
import { Container, Skeleton, Center } from '@chakra-ui/react';

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
      <h1> Explore</h1>
      <p>{totalCount} publications</p>
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
            <InfiniteScroll
              dataLength={publications.length}
              next={fetchMorePublications}
              hasMore={haveMorePublication}
              loader={
                <Container width='60%'>
                  <Skeleton startColor='red.500' endColor='orange.500' height='20px' speed='0.231' />
                </Container>
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
