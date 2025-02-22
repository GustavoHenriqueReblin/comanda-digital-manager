import { gql } from '@apollo/client';

export const BARTENDER_AUTH_REQUEST = gql`
  subscription AuthBartenderRequest {
    authBartenderRequest {
      id
      name
      securityCode
      token
    }
  }
`;

export const BARTENDER_AUTH_RESPONSE = gql`
  subscription AuthBartenderResponse {
    authBartenderResponse {
      data {
        id
        name
        securityCode
        token
      }
      authRequestStatus
    }
  }
`;