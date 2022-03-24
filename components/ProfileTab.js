
import PublicationView from './PublicationView'

import { Container, Skeleton } from '@chakra-ui/react';
import { gql, useQuery } from "@apollo/client";
import { initializeApollo, addApolloState } from "../lib/apolloClient";
import { namedConsoleLog, prettyJSON, capitalize } from '../lib/helpers';
import { BigNumber } from "@ethersproject/bignumber";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { DEMO_PROFILE_ID } from '../lib/config';
import InfiniteScroll from 'react-infinite-scroll-component';
import Pluralize from 'react-pluralize'
import { InfiniteScrollLoading, InfiniteScrollLoaded } from './InfiniteScrollStates';

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
// responsively style pages listing publications
function ProfileTab({ constCurrentProfileID, publicationType }) {
  // fetch publications of profileID
  namedConsoleLog('publicationType', publicationType);
  const { loading: loadingPublication, error: errorPublication, data, fetchMore, refetch } = useQuery(
    gql(GET_PUBLICATIONS),
    {
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          publicationTypes: publicationType,
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
  // namedConsoleLog('data?.publications', data?.publications)

  function fetchMorePublications() {
    // prettyJSON('publications.length', publications.length);
    const pageInfoNext = data.publications.pageInfo.next;
    prettyJSON('pageInfoNext', pageInfoNext);
    fetchMore({
      variables: {
        request: {
          profileId: constCurrentProfileID.toHexString(),
          publicationTypes: publicationType,
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
    <>
      {
        !havePublication && loadingPublication ? (
          <Skeleton height='20px'>loading</Skeleton>
        ) : errorPublication ? (
          <p>An error has occurred.</p>
        ) : !havePublication ? (
          <p>Publication not found</p>
        ) : (
          <Container
            display='flex'
            flexDirection='column'
            // maxWidth={{ base: '100%', md: '80% ' }}
            width={{ base: '100%', md: '80% ' }}
          >
            {/* <Pluralize singular={capitalize(publicationType[0])} plural={capitalize(publicationType[0].concat('S'))} count={totalCount} /> */}
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
        )
      }
    </>
  )
}


export default ProfileTab
