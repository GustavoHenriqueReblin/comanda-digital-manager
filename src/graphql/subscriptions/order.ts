import { gql } from '@apollo/client';

export const CHANGE_ORDER_STATUS = gql`
    subscription ChangeOrderStatus {
        ChangeOrderStatus {
            data {
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
            message
        }
    }
`;