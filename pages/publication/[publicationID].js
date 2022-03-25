import Layout from '../../components/layout'
import Sidebar from '../../components/sidebar'
import PublicationView from '../../components/PublicationView'
import PageContainer from '../../components/PageContainer'
import { Container, Stack, Skeleton, SkeletonCircle, SkeletonText, Divider, Heading, Text } from '@chakra-ui/react'

import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import { prettyJSON } from '../../lib/helpers';
import { useRouter } from 'next/router'
import { DEMO_PUBLICATION_ID } from '../../lib/config';

const GET_PUBLICATION = `
  query($request: PublicationQueryRequest!) {
    publication(request: $request) {
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

function Publication() {
  // get publicationID from params
  const router = useRouter();
  // demo publication needed because publicationID is undefined on first render
  // https://www.joshwcomeau.com/react/the-perils-of-rehydration/
  const publicationID = router.query.publicationID ?? DEMO_PUBLICATION_ID;
  // prettyJSON('publicationID', publicationID);

  // query main publication
  const { loading: loadingPublication, error: errorPost, data: dataPost, fetchMore: fetchMorePost } = useQuery(
    gql(GET_PUBLICATION),
    {
      variables: {
        request: { publicationId: publicationID },
        // request: { publicationId: '0x49-0x02' },
      },
      notifyOnNetworkStatusChange: true,
    });

  // manage edge cases
  // const posts = data?.posts?.edges?.map((edge) => edge.node) || [];
  // const havePosts = Boolean(posts.length);
  // const haveMorePosts = Boolean(data?.posts?.pageInfo?.hasNextPage);
  // prettyJSON('dataPost', dataPost);
  const publication = dataPost?.publication ?? undefined;
  // console.log(publication)
  const havePublication = Boolean(publication);
  console.log(`havePublication: ${havePublication}`)
  const haveMorePublication = Boolean(false);

  // query comments of main publication
  const { loading: loadingComments, error: errorComments, data: dataComments, fetchMore: fetchMoreComments } = useQuery(
    gql(GET_PUBLICATIONS),
    {
      variables: {
        request: { commentsOf: publicationID },
        // request: { publicationId: '0x49-0x02' },
      },
      notifyOnNetworkStatusChange: true,
    });
  // prettyJSON('dataComments', dataComments);

  const comments = dataComments?.publications.items || [];
  const haveComments = Boolean(comments.length);
  const haveMoreComments = Boolean(true);
  return (
    <>
      <Stack direction='column'>
        <Heading alignSelf={'center'}>Publication</Heading>
        {
          publication?.id && <Text alignSelf={'center'}>{publication?.id}</Text>
        }
      </Stack>
      {!havePublication && (loadingPublication || loadingComments) ? (
        <Skeleton height='20px'>loading</Skeleton>
      ) : errorPost ? (
        <p>An error has occurred.</p>
      ) : !havePublication ? (
        <p>No posts found.</p>
      ) : (
        <Container
        // border='2px solid blue'
        >
          <Stack
            // border='2px solid green'
            direction='column'
            alignItems='center'
          // justifyContent='space-around'
          // alignItems='stretch'
          >
            <Divider py={4} />
            <PublicationView key={publication.id} publication={publication} comments={comments} />
          </Stack>
        </Container>
      )
      }
    </>
  )
}

Publication.getLayout = function getLayout(page) {
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

//   const result = await apolloClient.query({
//     query: gql(GET_PUBLICATIONS),
//     variables: {
//       request: {publicationId: params.publicationID },
//       // request: {publicationId: '0x49-0x02' },
//     },
//   });
//   prettyJSON(`GET_PUBLICATION ${params.publicationID}`, result);
//   return addApolloState(apolloClient, {
//     props: { },
//   });
// }

// export async function getStaticPaths() {
//   const paths = []
//   return {paths, fallback: true }
// }

export default Publication
