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
import ProfileTab from '../../components/ProfileTab';
import Pluralize from 'react-pluralize'

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        location
        website
        twitterUrl
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        depatcher {
          address
          canUseRelay
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
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          __typename
        }
      }
      pageInfo {
        prev
        next
        totalCount
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

  const { loading: loadingProfile, error: errorProfile, data: dataProfile } = useQuery(
    gql(GET_PROFILES),
    {
      variables: {
        request: {
          profileIds: profileID
        }
      },
      notifyOnNetworkStatusChange: true
    });

  const profile = dataProfile?.profiles?.items?.[0] || undefined;
  const haveProfile = Boolean(profile?.id);

  return (
    <section>
      {
        !haveProfile && loadingProfile ? (
          <Skeleton height='20px'>loading</Skeleton>
        ) : errorProfile ? (
          <p>An error has occurred.</p>
        ) : !haveProfile ? (
          <p>Profile not found</p>
        ) : (
          <Tabs isFitted isLazy lazyBehavior="keepMounted">
            <TabList>
              <Tab isDisabled={profile.stats.totalPosts < 1}>
                <Pluralize singular={'Post'} plural={'Posts'} zero={'No posts'} count={profile.stats.totalPosts} />
              </Tab>
              <Tab isDisabled={profile.stats.totalComments < 1}>
                <Pluralize singular={'Comment'} plural={'Comments'} zero={'No comments'} count={profile.stats.totalComments} />
              </Tab>
              <Tab isDisabled={profile.stats.totalMirrors < 1}>
                <Pluralize singular={'Mirror'} plural={'Mirrors'} zero={'No mirrors'} count={profile.stats.totalMirrors} />
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ProfileTab constCurrentProfileID={constCurrentProfileID} publicationType={['POST']} />
              </TabPanel>
              <TabPanel>
                <ProfileTab constCurrentProfileID={constCurrentProfileID} publicationType={['COMMENT']} />
              </TabPanel >
              <TabPanel>
                <ProfileTab constCurrentProfileID={constCurrentProfileID} publicationType={['MIRROR']} />
              </TabPanel>
            </TabPanels >
          </Tabs>
        )
      }
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
