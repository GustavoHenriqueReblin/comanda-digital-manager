import { gql } from '@apollo/client';

export const LoginQuery = gql`
  query login($input: LoginInput!) {
    login(input: $input) {
      data {
        id
        name
        email
        password
        token
      }
    }
  }
`;

export const findUserQuery = gql`
  query User {
    user {
      data {
        id
        name
        email
        password
        token
      }
    }
  }
`;
