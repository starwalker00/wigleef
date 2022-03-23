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
  Select
} from '@chakra-ui/react';
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import { prettyJSON } from '../../lib/helpers';
import { BigNumber } from "@ethersproject/bignumber";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DEMO_PROFILE_ID } from '../../lib/config';

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
        },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    });
  // manage edge cases
  // const posts = data?.posts?.edges?.map((edge) => edge.node) || [];
  // const havePosts = Boolean(posts.length);
  // const haveMorePosts = Boolean(data?.posts?.pageInfo?.hasNextPage);
  // prettyJSON('publications', publications);
  const publications = data?.publications?.items || [];
  const havePublication = Boolean(publications.length);
  const haveMorePublication = Boolean(true);

  return (
    <section>
      {/* {console.log(publications)} */}
      <h1>My publications</h1>
      {!havePublication && loadingPublication ? (
        <Skeleton height='20px' />
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
            event.preventDefault();
            fetchMore({
              variables: {
                first: 5,
                after: data.posts.pageInfo.endCursor,
              }
            });
          }}>
            <button type="submit" disabled={loadingPublication}>
              {loadingPublication ? "Loading..." : "Load more"}
            </button>
          </form>
        ) : (
          <p>✅ All publications loaded.</p>
        )
      ) : null}
    </section>
  )
}

Profile.getLayout = function getLayout(page) {
  return (
    <Layout>
      <Sidebar />
      <PageContainer>
        {page}
      </PageContainer>
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
