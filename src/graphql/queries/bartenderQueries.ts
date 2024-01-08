import { gql } from '@apollo/client';

export const GetBartender = gql`
  query GetBartender($input: BartenderInput!) {
    bartender(input: $input) {
      data {
        id
        isWaiting
        name
        securityCode
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
        isWaiting
        name
        securityCode
        token
      }
      message
    }
  }
`;

export const BARTENDER_AUTH = gql`
  subscription {
    authBartenderRequest {
      id
      securityCode
      name
      token
      isWaiting
    }
  }
`;