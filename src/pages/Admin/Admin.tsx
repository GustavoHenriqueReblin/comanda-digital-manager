import React, { useEffect, useState } from "react";
import './admin.scss';

import { useLazyQuery, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_REQUEST, GetBartenderIsWaiting } from "../../graphql/queries/bartenderQueries";

function Admin() {
    const [showApprovalCard, setShowApprovalCard] = useState(false);
    const [getBartenderIsWaiting, { data: bartenderIsWaitingData }] = useLazyQuery(GetBartenderIsWaiting);
    const { data: authRequestData } = useSubscription(BARTENDER_AUTH_REQUEST);

    const cardTemp = (bartender: any) => {
        return (
            <div className="card" key={bartender.id}>
                <p>{bartender.name}</p>
                <p>{bartender.securityCode}</p>
            </div>
        );
    }

    useEffect(() => {
        if (authRequestData) {
            setShowApprovalCard(true);
        }  
    }, [authRequestData]);

    useEffect(() => {
        if (bartenderIsWaitingData) {
            setShowApprovalCard(true);
        } else {
            getBartenderIsWaiting();
        }
    }, [bartenderIsWaitingData, getBartenderIsWaiting]);

    return (
        <>
            { showApprovalCard 
                ? (
                    <div className="card-container">
                        {bartenderIsWaitingData?.bartendersIsWaiting?.map((bartender: any) => (
                            cardTemp(bartender.data)
                        ))}
                        {authRequestData?.authBartenderRequest &&
                            cardTemp(authRequestData?.authBartenderRequest)
                        }
                    </div>
                ) 
                : (<h1>Admin</h1>)
            }
        </>
    );
  }
    
  export default Admin;