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
