import { gql } from '@apollo/client';

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