import React, { useEffect, useState } from "react";
import './admin.scss';

import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_REQUEST, GetBartenderIsWaiting, UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import Cookies from "js-cookie";

function Admin() {
    const [showApprovalCard, setShowApprovalCard] = useState(false);
    const [getBartenderIsWaiting, { data: bartenderIsWaitingData }] = useLazyQuery(GetBartenderIsWaiting);
    const { data: authRequestData } = useSubscription(BARTENDER_AUTH_REQUEST);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);

    const sendResponseAuthReq = (bartender: any, approved: boolean) => {
        updateBartender({ variables: {
            input: {
                id: bartender.id, 
                isWaiting: false,
                isApproved: approved,
                token: bartender.token
            },
        }, });
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        if (cookieName) {
            Cookies.remove(cookieName);
        }
        setShowApprovalCard(false);
    };

    useEffect(() => {
        if (authRequestData) {
            setShowApprovalCard(true);
        }  
    }, [authRequestData]);

    useEffect(() => {
        bartenderIsWaitingData ? setShowApprovalCard(true) : getBartenderIsWaiting();
    }, [bartenderIsWaitingData, getBartenderIsWaiting]);

    return (
        <>
            <div className="card-container">
                {bartenderIsWaitingData?.bartendersIsWaiting?.map((bartender: any) => (
                    <BartenderAuthCard
                        key={bartender.data.id}
                        bartender={bartender.data}
                        isVisible={showApprovalCard}
                        sendResponseAuthReq={sendResponseAuthReq}
                    />
                ))}
                {authRequestData?.authBartenderRequest && (
                    <BartenderAuthCard
                        bartender={authRequestData.authBartenderRequest}
                        isVisible={showApprovalCard}
                        sendResponseAuthReq={sendResponseAuthReq}
                    />
                )}
            </div>
        </>
    );
  }
    
  export default Admin;