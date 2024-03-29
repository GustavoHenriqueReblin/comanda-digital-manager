import { gql } from '@apollo/client';

export const GetOrders = gql`
    query GetOrders($input: OrderStatusInput!) {
        orders(input: $input) {
            id
            bartenderId
            bertenderName
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
    },
`;
