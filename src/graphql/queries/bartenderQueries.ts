import { gql } from '@apollo/client';

export const GetBartender = gql`
  query GetBartender($input: BartenderInput!) {
    bartender(input: $input) {
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

export const GetBartenderIsWaiting = gql`
  query GetBartenderIsWaiting {
    bartendersIsWaiting {
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

export const BARTENDER_AUTH_REQUEST = gql`
  subscription {
    authBartenderRequest {
      id
      name
      securityCode
      isWaiting
      isApproved
      token
    }
  }
`;

export const BARTENDER_AUTH_RESPONSE = gql`
  subscription {
    authBartenderResponse {
      id
      isApproved
      isWaiting
      name
      securityCode
      token
    }
  }
`;