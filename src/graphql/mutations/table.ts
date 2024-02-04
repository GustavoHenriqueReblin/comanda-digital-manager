import { gql } from '@apollo/client';

export const UPDATE_TABLE = gql`
    mutation UpdateTable($input: TableInput!) {
        updateTable(input: $input) {
            data {
                code
                id
                state
            }
            message
        }
    }
`;

