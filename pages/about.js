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

// const isServerSide = typeof window === 'undefined'
// const people = [
//     { name: "Dan Abramov", image: "https://bit.ly/dan-abramov" },
//     { name: "Kent Dodds", image: "https://bit.ly/kent-c-dodds" },
//     { name: "Segun Adebayo", image: "https://bit.ly/sage-adebayo" },
//     { name: "Prosper Otemuyiwa", image: "https://bit.ly/prosper-baba" },
//     { name: "Ryan Florence", image: "https://bit.ly/ryan-florence" },
// ];

const people = [
    { profileId: '0x01ac', name: 'josh stevens', picture: "https://bit.ly/prosper-baba" },
    { profileId: '0x01ac', name: 'josh stevens', picture: "https://bit.ly/prosper-baba" },
    { profileId: '0x01ac', name: 'josh steverrns', picture: "https://bit.ly/ryan-florence" },
];


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

function About() {
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
    // var mapped = _.map(profiles, _.partialRight(_.pick, ['id', 'name']));
    // namedConsoleLog('mapped', mapped);

    useEffect(() => {
        // fetch once on mount to fill initial profile suggestions
        searchProfile({
            variables: {
                request: {
                    query: 'z', type: 'PROFILE', limit: 10
                },
            }
        });
    }, []);

    function fetchProfile(query) {
        if (!query) return
        // debouncing
        setTimeout(() => {
            // querying
            searchProfile({
                variables: {
                    request: {
                        query: query, type: 'PROFILE', limit: 10
                    },
                }
            });
        }, 500)
    }
    // if (loadingSearch) return <p>Loading ...</p>;
    if (errorSearch) return `Error! ${errorSearch}`;
    return (
        <section>
            <h2>Layout Example (About)</h2>
            <Input placeholder='Basic usage' />

            <Flex pt="48" justify="center" align="center" w="full" direction="column">
                <FormControl id="email" w="60" >
                    <FormLabel>Olympics Soccer Winner</FormLabel>
                    <AutoComplete openOnFocus>
                        <AutoCompleteInput
                            variant="filled"
                            autoComplete="off" /* browser autocomplete */
                            // onChange={event => (doCityFilter(event.target.value))} 
                            // onChange={event => (console.log(event.target.value))}
                            onChange={event => (fetchProfile(event.target.value))}
                        />
                        <AutoCompleteList>
                            {
                                profiles.map((person, oid) => (
                                    <AutoCompleteItem
                                        key={`option-${oid}`}
                                        value={person?.name || ''}
                                        textTransform="capitalize"
                                        align="center"
                                    >
                                        <LinkBox as='div'>
                                            <NextLink
                                                href={{
                                                    pathname: '/profile/[profileID]',
                                                    query: { profileID: person?.profileId },
                                                }}
                                                passHref>
                                                <LinkOverlay>
                                                    <Stack direction='row'>
                                                        <Avatar size="sm" name={person.name} src={person?.picture} />
                                                        <Text fontSize='sm' ml="4">{person?.name} — {person?.profileId}</Text>
                                                    </Stack>
                                                </LinkOverlay>
                                            </NextLink>
                                        </LinkBox>
                                    </AutoCompleteItem>
                                ))
                            }
                        </AutoCompleteList>
                    </AutoComplete>
                    <FormHelperText>Who do you support.</FormHelperText>
                </FormControl>
            </Flex >
        </section >
    )
}

About.getLayout = function getLayout(page) {
    return (
        <Layout>
            <Sidebar />
            {page}
        </Layout>
    )
}

export default About


// search:
// items: Array(4)
// 0:
    // bio: "hey this is an update ujyu"
    // coverPicture: null
    // depatcher: null
    // followModule: null
    // handle: "1647683848913"
    // location: "UK"
    // name: "josh stevens"
    // ownedBy: "0x0c758F326D6700dB37B5d7515ae734C5b4CB8668"
    // picture: null
    // profileId: "0x3b"
    // stats: { totalFollowers: 2, totalFollowing: 1, totalPosts: 5, totalComments: 0, totalMirrors: 0, … }
    // twitterUrl: null
    // website: null
    // __typename: "Profile"
// 1: {profileId: '0x01ac', name: 'josh stevens', bio: 'hey this is my profile', location: 'UK', website: null, …}
// 2: {profileId: '0x38', name: 'Josh', bio: 'creator of the architecture\n', location: 'UK', website: 's', …}
// 3: {profileId: '0x20', name: null, bio: null, location: null, website: null, …}
// length: 4
// [[Prototype]]: Array(0)
// pageInfo: {prev: '{"offset":0}', totalCount: 4, next: '{"offset":4}', __typename: 'PaginatedResultInfo'}
