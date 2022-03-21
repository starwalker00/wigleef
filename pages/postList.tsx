import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import {
  Text,
  Button,
  Flex,
  Box,
  Spacer,
  Stack,
  Select
} from '@chakra-ui/react';
import { gql, useQuery } from "@apollo/client";
import { prettyJSON } from '../lib/helpers';
import { ethers, utils, Wallet } from 'ethers';
import { useProfileID, useDispatchProfileID } from "../components/context/AppContext";
import Link from 'next/link'

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

function PostList() {
  const profileIDApp: ethers.BigNumber = useProfileID()
  const dispatch = useDispatchProfileID()

  const { loading, error, data, fetchMore } = useQuery(
    gql(GET_PUBLICATIONS),
    {
      variables: {
        request: {
          profileId: profileIDApp.toHexString(),
          publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
        },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    });
  // const posts = data?.posts?.edges?.map((edge) => edge.node) || [];
  // const havePosts = Boolean(posts.length);
  // const haveMorePosts = Boolean(data?.posts?.pageInfo?.hasNextPage);

  const publications = data?.publications?.items || [];
  const havePosts = Boolean(publications.length);
  const haveMorePosts = Boolean(true);
  // prettyJSON('publications', publications);
  return (
    <section>
      <h1>My Posts</h1>
      {!havePosts && loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>An error has occurred.</p>
      ) : !havePosts ? (
        <p>No posts found.</p>
      ) : (
        publications.map((publication) => {
          return (
            <article key={publication.id} style={{ border: "2px solid #eee", padding: "1rem", marginBottom: "1rem", borderRadius: "10px" }}>
              <h2>{publication.__typename}</h2>
              <Link
                href={{
                  pathname: '/publication/[publicationID]',
                  query: { publicationID: publication.id },
                }}
              >
                <a><h3>{publication.id}</h3></a>
              </Link>
              <p>{publication.metadata.content}</p>
              <p>mirror : {publication.stats.totalAmountOfMirrors}</p>
              <p>collects : {publication.stats.totalAmountOfCollects}</p>
              <p>comments : {publication.stats.totalAmountOfComments}</p>
            </article>
          );
        })
      )}
      {havePosts ? (
        haveMorePosts ? (
          <form onSubmit={event => {
            event.preventDefault();
            fetchMore({
              variables: {
                first: 5,
                after: data.posts.pageInfo.endCursor,
              }
            });
          }}>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </button>
          </form>
        ) : (
          <p>✅ All posts loaded.</p>
        )
      ) : null}
    </section>
  )
}

PostList.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar />
      {page}
    </Layout>
  )
}

export default PostList
