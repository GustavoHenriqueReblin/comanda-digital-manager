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

export const GetBartendersAreWaiting = gql`
  query GetBartendersAreWaiting {
    bartendersAreWaiting {
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

export const GetBartenderDataByToken = gql`
  query GetBartenderByToken($input: BartenderInput!) {
    getBartenderByToken(input: $input) {
      data {
        id
        name
        securityCode
        token
      }
      message
    }
  }
`;