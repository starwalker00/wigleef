import { apolloClient } from './apollo-client';
import { gql } from '@apollo/client'

const CREATE_COMMENT_TYPED_DATA = `
  mutation($request: CreatePublicCommentRequest!) { 
    createCommentTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          CommentWithSig {
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
        profileIdPointed
        pubIdPointed
        contentURI
        collectModule
        collectModuleData
        referenceModule
        referenceModuleData
      }
     }
   }
 }
`

export const createCommentTypedData = (createCommentTypedDataRequest, accessToken) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_COMMENT_TYPED_DATA),
    variables: {
      request: createCommentTypedDataRequest
    },
    context: { headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' } }
  })
}