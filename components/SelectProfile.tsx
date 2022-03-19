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
import { initializeApollo, addApolloState } from "../lib/apolloClient";
import { prettyJSON } from '../lib/helpers';

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

function SelectProfile({ address }) {
    const { loading, error, data, fetchMore } = useQuery(
        gql(GET_PROFILES),
        {
            variables: {
                request: { ownedBy: address },
            },
            notifyOnNetworkStatusChange: true,
        });
    if (data) {
        prettyJSON('data', data)
        if (data.profiles?.items?.length < 1) {
            return (
                <>
                    <Text>you do not own a profile</Text>

                </>
            )
        } else {
            // add first profile to context
            return (
                <>
                    <Stack spacing={3}>
                        <Select placeholder='Profiles'>
                            {
                                data.profiles?.items.map((profile) => (
                                    <option value={profile.id}>{profile.handle}{'#'}{parseInt(profile.id, 16)}</option>
                                ))
                            }
                        </Select>
                    </Stack>
                </>
            )
        }
    }
    else if (loading) {
        return (
            <>
                <Text>loading</Text>
            </>
        )
    }
    else {
        return (
            <>
            </>
        )
    }
}

export default SelectProfile;
