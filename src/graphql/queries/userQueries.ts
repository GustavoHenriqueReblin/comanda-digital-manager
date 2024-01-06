import { gql } from '@apollo/client';

export const GetUsers = gql`
    query {
        users {
          id
          username
          password
          token
        }
    }
`;

export const GetUser = gql`
  query GetUser($input: UserInput!) {
    user(input: $input) {
      id
      username
      password
      token
    }
  }
`;