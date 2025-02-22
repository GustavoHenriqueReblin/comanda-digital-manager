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

export const BartenderAccess = gql`
  mutation BartenderAccess($input: BartenderAccessInput!) {
    bartenderAccess(input: $input) {
      data {
        id
        name
        securityCode
        token
      }
    }
  }
`;

export const CancelAuthBartenderRequest = gql`
  mutation CancelAuthBartenderRequest($input: CancelAuthBartenderRequestInput!) {
    cancelAuthBartenderRequest(input: $input) {
      data {
        id
        name
        securityCode
        token
      }
    }
  }
`;
