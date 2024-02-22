import { gql } from '@apollo/client';

export const GetUsers = gql`
    query {
      users {
        data {
          id
          name
          email
          password
          token
        }
        message
      }
    }
`;

export const GetUser = gql`
  query GetUser($input: UserInput!) {
    user(input: $input) {
      data {
        id
        name
        email
        password
        token
      }
      message
    }
  }
`;

export const GetUserByToken = gql`
    query Query($input: UserInput!) {
      getUserByToken(input: $input) {
        data {
          id
          name
          email
          password
          token
        }
        message
      }
    }
`;