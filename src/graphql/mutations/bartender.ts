import { gql } from '@apollo/client';

export const UPDATE_BARTENDER = gql`
  mutation UpdateBartender($input: UpdateBartenderInput!) {
    updateBartender(input: $input) {
      data {
        id
        name
        securityCode
        isWaiting
        isApproved
        token
      }
      message
    }
  }
`;