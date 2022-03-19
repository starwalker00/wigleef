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

import { useProfileID, useDispatchProfileID } from "./context/AppContext";

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
  const profileIDApp: ethers.BigNumber = useProfileID()
  const dispatch = useDispatchProfileID()

  const { loading, error, data, fetchMore } = useQuery(
    gql(GET_PROFILES),
    {
      variables: {
        request: { ownedBy: address },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    });

  function changeProfileID(event: any) {
    dispatch({ type: 'set_profileID', payload: ethers.BigNumber.from(event.target.value) });
  }

  if (data) {
    // prettyJSON('data', data)
    console.log(`found : ${data.profiles?.items?.length} profiles`)
    if (data.profiles?.items?.length < 1) {
      return (
        <>
          <Text>you do not own a profile</Text>
        </>
      )
    } else {
      // add first profile to context if no profile ID is set
      if (profileIDApp.eq(0)) {
        let firstProfileID = ethers.BigNumber.from(data.profiles.items[0].id);
        dispatch({ type: 'set_profileID', payload: firstProfileID });
      }
    };
    return (
      <>
        <Stack spacing={3}>
          <Select onChange={(event) => changeProfileID(event)}>
            {
              data.profiles?.items.map((profile) => {
                let profileID = ethers.BigNumber.from(profile.id);
                return (< option selected={profileID.eq(profileIDApp)} value={profileID.toString()} > {profile.handle}{'#'}{profileID.toString()}</option>)
              }

              )
            }
          </Select>
        </Stack>
      </>
    )
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
