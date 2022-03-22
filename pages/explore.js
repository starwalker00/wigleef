import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PublicationView from '../components/PublicationView'

import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../lib/apolloClient";
import { prettyJSON } from '../lib/helpers';

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
        request: { sortCriteria: 'TOP_COMMENTED', limit: 2, cursor: 0 },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const publications = data?.explorePublications?.items || [];
  const havePublication = Boolean(publications.length);
  const totalCount = data?.explorePublications?.pageInfo?.totalCount || 0;
  const haveMorePublication = Boolean(publications.length < totalCount);
  return (
    <section>
      {/* {console.log(publications)} */}
      <h1>Explore</h1>
      <p>{totalCount} publications</p>
      {!havePublication && loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>An error has occurred.</p>
      ) : !havePublication ? (
        <p>No publications found.</p>
      ) : (
        publications.map((publication) => {
          return (
            <PublicationView key={publication.id} publication={publication} />
          );
        })
      )}
      {havePublication ? (
        haveMorePublication ? (
          <form onSubmit={event => {
            // prettyJSON('publications.length', publications.length);
            event.preventDefault();
            const pageInfoNext = data.explorePublications.pageInfo.next;
            // prettyJSON('pageInfoNext', pageInfoNext);
            fetchMore({
              variables: {
                request: {
                  sortCriteria: 'TOP_COMMENTED',
                  limit: 1,
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
          }}>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </button>
          </form>
        ) : (
          <p>✅ All publications loaded.</p>
        )
      ) : null
      }
    </section >
  )
}

Explore.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar />
      {page}
    </Layout>
  )
}

export async function getStaticProps(context) {
  const apolloClient = initializeApollo();

  const result = await apolloClient.query({
    query: gql(EXPLORE_PUBLICATIONS),
    variables: {
      request: { sortCriteria: 'TOP_COMMENTED', limit: 2, cursor: 0 },
    },
  });
  // prettyJSON('explore: result', result.data);

  return addApolloState(apolloClient, {
    props: {},
  });
}

export default Explore
