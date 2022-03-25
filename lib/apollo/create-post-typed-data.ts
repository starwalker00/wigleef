import { apolloClient } from './apollo-client';
import { gql } from '@apollo/client';

const CREATE_POST_TYPED_DATA = `
mutation($request: CreatePublicPostRequest!) { 
  createPostTypedData(request: $request) {
    id
    expiresAt
    typedData {
      types {
        PostWithSig {
          name
          type
        }
      }
    domain {
      name
      chainId
      version
      verifyingContract
    }
    value {
      nonce
      deadline
      profileId
      contentURI
      collectModule
      collectModuleData
      referenceModule
      referenceModuleData
    }
  }
}
}
`;

export const createPostTypedData = (createPostTypedDataRequest: any, accessToken: any) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_POST_TYPED_DATA),
    variables: {
      request: createPostTypedDataRequest,
    },
    context: { headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' } }
  });
};
