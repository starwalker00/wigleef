import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useConnect } from 'wagmi'
import { Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Flex, FormControl, FormHelperText, FormLabel, Avatar, Text, Link, Stack } from "@chakra-ui/react";
import { LinkBox, LinkOverlay } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";
import { namedConsoleLog } from '../lib/helpers'
import { gql, useLazyQuery } from "@apollo/client"
import _ from 'lodash'
import { useRouter } from 'next/router'

const SEARCH = `
  query($request: SearchQueryRequest!) {
    search(request: $request) {
			... on PublicationSearchResult {
       __typename 
      items {
        __typename 
        ... on Comment {
          ...CommentFields
        }
        ... on Post {
          ...PostFields
        }
      }
      pageInfo {
        prev
        totalCount
        next
      }
    }
    ... on ProfileSearchResult {
      __typename 
      items {
        ... on Profile {
          ...ProfileFields
        }
      }
      pageInfo {
        prev
        totalCount
        next
      }
     }
    }
  }

fragment MediaFields on Media {
  url
  mimeType
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

fragment ProfileFields on Profile {
  profileId: id,
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

export default function SearchBar() {
  const router = useRouter();
  // search query
  const [searchProfile, { loading: loadingSearch, error: errorSearch, data: dataSearch }] = useLazyQuery(
    gql(SEARCH),
    {
      variables: {
        request: {
          query: 'josh', type: 'PROFILE', limit: 10
        },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache"
    },
  );
  // namedConsoleLog('dataSearch', dataSearch);
  const profiles = dataSearch?.search?.items || [];
  // namedConsoleLog('profiles', profiles);

  useEffect(() => {
    // fetch once on mount to fill initial profile suggestions
    searchProfile({
      variables: {
        request: {
          query: 'josh', type: 'PROFILE', limit: 10
        },
      }
    });
  }, []);

  // query a search to the API, called on search input change
  function fetchProfile(query) {
    if (!query) return
    // debouncing
    setTimeout(() => {
      // querying
      searchProfile({
        variables: {
          request: {
            // TODO: removing spaces for now, it causes server error
            query: query.replace(/\s/gm, ''), type: 'PROFILE', limit: 10
          },
        }
      });
    }, 500)
  }

  // if (loadingSearch) return <p>Loading ...</p>;
  if (errorSearch) return <div>`Error! ${errorSearch}`</div>;
  return (
    <Flex justify="center" align="center" w="full" direction="column" >
      <FormControl id="name">
        {/* <FormLabel>Olympics Soccer Winner</FormLabel> */}
        <AutoComplete openOnFocus
          onSelectOption={({ item }) => {
            router.push({
              pathname: '/profile/[profileID]',
              query: { profileID: item.originalValue.profileId },
            })
          }}>
          <AutoCompleteInput
            // variant="filled"
            autoComplete="off" /* browser autocomplete off*/
            onChange={event => (fetchProfile(event.target.value))}
          />
          <AutoCompleteList>
            {
              profiles.map((person, oid) => (
                <AutoCompleteItem
                  key={`option-${person?.profileId}`}
                  value={person}
                  getValue={val => val?.name || ''}
                  textTransform="capitalize"
                  align="center"
                >
                  <Stack direction='row'>
                    <Avatar size="sm" name={person.name} src={person?.picture} />
                    <Text fontSize='sm'>{person?.name} — {person?.profileId}</Text>
                  </Stack>
                </AutoCompleteItem>
              ))
            }
          </AutoCompleteList>
        </AutoComplete>
        {/* <FormHelperText>Who do you support.</FormHelperText> */}
      </FormControl>
    </Flex >
  );
}
