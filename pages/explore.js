import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import PublicationView from '../components/PublicationView'

import Link from 'next/link'

import { gql, useQuery, InMemoryCache } from "@apollo/client";
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
  // const cache = new InMemoryCache({
  //   typePolicies: {
  //     Query: {
  //       fields: {
  //         items: {
  //           keyArgs: false,
  //           // Concatenate the incoming list items with
  //           // the existing list items.
  //           merge(existing = [], incoming) {
  //             console.log(`existing ${existing}`);
  //             return [...existing, ...incoming];
  //           },
  //         }
  //       }
  //     }
  //   }
  // })
  const { loading, error, data, fetchMore } = useQuery(
    gql(EXPLORE_PUBLICATIONS),
    {
      variables: {
        request: { sortCriteria: 'TOP_COMMENTED', limit: 20, cursor: 0 },
      },
      notifyOnNetworkStatusChange: true,
      // fetchPolicy: 'no-cache'
      // fetchPolicy: 'cache-and-network',
      // nextFetchPolicy: 'no-cache',
      // fetchPolicy: 'standby',
      // cache: cache
    },
  );
  // const posts = data?.posts?.edges?.map((edge) => edge.node) || [];
  // const havePosts = Boolean(posts.length);
  // const haveMorePosts = Boolean(data?.posts?.pageInfo?.hasNextPage);

  const publications = data?.explorePublications?.items || [];
  const havePublication = Boolean(publications.length);
  const haveMorePublication = Boolean(true);
  function getRandomArbitrary(min, max) {
    console.log(min)
    console.log(max)
    return Math.floor(Math.random() * (max - min) + min);
  }
  return (
    <section>
      {console.log(publications)}
      <h1>Explore</h1>
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
          // return (
          //   <article key={post.id} style={{ border: "2px solid #eee", padding: "1rem", marginBottom: "1rem", borderRadius: "10px" }}>
          //     <h2>{post.__typename}</h2>
          //     <Link
          //       href={{
          //         pathname: '/publication/[publicationID]',
          //         query: { publicationID: post.id },
          //       }}
          //     >
          //       <a><h3>{post.id}</h3></a>
          //     </Link>
          //     <p>{post.metadata.content}</p>
          //     <p>mirror : {post.stats.totalAmountOfMirrors}</p>
          //     <p>collects : {post.stats.totalAmountOfCollects}</p>
          //     <p>comments : {post.stats.totalAmountOfComments}</p>
          //   </article>
          // );
        })
      )}
      {havePublication ? (
        haveMorePublication ? (
          <form onSubmit={event => {
            prettyJSON('publications.length', publications.length);
            event.preventDefault();
            // prettyJSON('data', data);
            const pageInfoNext = JSON.parse(data.explorePublications.pageInfo.next);
            // const pageInfo = JSON.parse(data.explorePublications.pageInfo);
            prettyJSON('pageInfo', pageInfoNext);
            const randomCursor = getRandomArbitrary(2, data.explorePublications.pageInfo.totalCount);
            console.log(randomCursor);
            fetchMore({
              variables: {
                request: {
                  sortCriteria: 'TOP_COMMENTED',
                  limit: 1,
                  // timestamp: pageInfoNext.timestamp,
                  // cursor: data.explorePublications.items.length + 1,
                  // cursor: 8,
                  // cursor: pageInfoNext.offset + 1,
                  cursor: randomCursor
                  // randomizer: pageInfoNext.randomizer // param unavailable for now?
                },
                // request: { sortCriteria: 'TOP_COMMENTED', limit: 11, cursor: 1 },
              },
              updateQuery: (prevResult, { fetchMoreResult }) => {
                // prettyJSON('prevResult', fetchMoreResult);
                // prettyJSON('fetchMoreResult', fetchMoreResult);
                console.log('updateQueryupdateQueryupdateQueryupdateQueryupdateQuery')
                console.log(prevResult)
                console.log(fetchMoreResult)
                prettyJSON('fetchMoreResult', fetchMoreResult.explorePublications.items[0].id);
                // fetchMoreResult.explorePublications.items = [
                //   ...prevResult.explorePublications.items,
                //   ...fetchMoreResult.explorePublications.items
                // ];
                // fetchMoreResult.explorePublications.items = [...new Set([...prevResult.explorePublications.items, ...fetchMoreResult.explorePublications.items])]
                let allItems = prevResult.explorePublications.items.concat(fetchMoreResult.explorePublications.items);
                fetchMoreResult.explorePublications.items = allItems.filter((item, index) => { return (allItems.indexOf(item) == index) })
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
      request: { sortCriteria: 'TOP_COMMENTED', limit: 20, cursor: 0 },
    },
  });
  prettyJSON('explore: result', result.data);

  return addApolloState(apolloClient, {
    props: {},
  });
}

export default Explore
