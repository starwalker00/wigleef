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
import { BigNumber } from "@ethersproject/bignumber";

import { useProfileID, useDispatchProfileID } from "./context/AppContext";
import { useState, useEffect } from 'react';
import { UNSET_CONTEXT_PROFILE_ID } from '../lib/config';
import NextLink from 'next/link'
import { ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';
import _ from 'lodash'

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
  const { profileIDApp } = useProfileID();
  const dispatch = useDispatchProfileID()

  // get profiles ownedBy connected address
  const { loading, error, data, fetchMore, called } = useQuery(
    gql(GET_PROFILES),
    {
      variables: {
        request: { ownedBy: address },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    });

  // set first profile to appcontext if no profile ID is set
  if (profileIDApp.eq(UNSET_CONTEXT_PROFILE_ID) && data?.profiles?.items?.length > 0) {
    let firstProfileID = BigNumber.from(data.profiles.items[0].id);
    dispatch({ type: 'set_profileID', payload: firstProfileID });
  }

  // handle select one of owned profileID
  function changeProfileID(event: any) {
    dispatch({ type: 'set_profileID', payload: BigNumber.from(event.target.value) });
  }

  if (data) {
    // prettyJSON('data', data)
    console.log(`found : ${data.profiles?.items?.length} profiles`)
    if (data.profiles?.items?.length < 1) {
      return (
        <>
          <Stack>
            <Text fontSize='sm'>You do not own a profile.</Text>
            <NextLink href={'/createProfile'} passHref>
              <Button
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                leftIcon={<AddIcon h={4} w={4} color={'gray.300'} />}
                autoFocus={true}
              >
                Create one
              </Button>
            </NextLink>
          </Stack>
        </>
      )
    };

    {/* display profiles in an alphabetical order */ }
    data.profiles?.items.map((element) => {
      let name = element?.name ?? element.handle;
      let profileIDhexString = BigNumber.from(element.id);
      return element.displayName = name.concat(' — ').concat(profileIDhexString);
    })
    let sortedProfiles = _.sortBy(data.profiles?.items, ['displayName']);
    return (
      <>
        <Stack spacing={3}>
          <Select onChange={(event) => changeProfileID(event)}>
            {
              sortedProfiles.map((profile) => {
                let profileID = BigNumber.from(profile.id);
                return (
                  <option
                    key={profileID.toHexString()}
                    defaultValue={profileIDApp.toHexString()}
                    value={profileID.toHexString()} >
                    {profile.displayName}
                  </option>)
              })
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
