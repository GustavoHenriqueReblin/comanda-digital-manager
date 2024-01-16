import { gql } from '@apollo/client';

export const COMPLETED_ORDERS = gql`
    subscription CompletedOrders {
        completedOrders {
            data {
                id
                bartenderId
                tableId
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