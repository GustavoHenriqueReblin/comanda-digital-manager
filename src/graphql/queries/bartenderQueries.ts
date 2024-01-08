import { gql } from '@apollo/client';

export const GetBartender = gql`
  query GetBartender($input: BartenderInput!) {
    bartender(input: $input) {
        id
        name
        securityCode
        token
    }
  }
`;

export const MESSAGE_ADDED = gql`
  subscription {
    messageAdded
  }
`;