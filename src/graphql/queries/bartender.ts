import { gql } from '@apollo/client';

export const FindBartender = gql`
  query Bartender($input: BartenderInput) {
    bartender(input: $input) {
      data {
        id
        name
        securityCode
        token
      }
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
        token
      }
    }
  }
`;