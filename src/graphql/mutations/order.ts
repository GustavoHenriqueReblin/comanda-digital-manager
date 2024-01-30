import { gql } from '@apollo/client';

export const UPDATE_ORDER = gql`
    mutation UpdateOrder($input: OrderInput!) {
        updateOrder(input: $input) {
            data {
                id
                bartenderId
                tableId
                tableCode
                value
                date
                status
                items {
                    id
                    orderId
                    productId
                    value
                    status
                }
            }
            message
        }
    }
`;