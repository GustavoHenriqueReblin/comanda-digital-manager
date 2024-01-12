/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import './admin.scss';

import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_REQUEST, BARTENDER_AUTH_RESPONSE, GetBartendersAreWaiting, UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import Loading from "../../components/Loading";
import Cookies from "js-cookie";

function Admin() {
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [data, setData] = useState<any>();
    const [getBartendersAreWaiting] = useLazyQuery(GetBartendersAreWaiting);
    const { data: authRequestData } = useSubscription(BARTENDER_AUTH_REQUEST);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const { data: authResponseData } = useSubscription(BARTENDER_AUTH_RESPONSE);

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
            setIsVisible(false);
            Cookies.remove(cookieName);
        }
    };

    const fetchBartendersAreWaiting = () => {
        return new Promise((resolve, reject) => {
            getBartendersAreWaiting()
                .then(res => {
                    resolve(res.data ? res.data.bartendersAreWaiting.map((item: any) => item.data) : null);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    useEffect(() => {
        authRequestData
            ? setData(authRequestData.authBartenderRequest)
            : fetchBartendersAreWaiting()
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erro ao buscar dados:", error);
                });

        setIsVisible(true);
    }, [authRequestData]);

    useEffect(() => {
        if (authResponseData) {
            fetchBartendersAreWaiting()
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erro ao buscar dados:", error);
                });
        }
    }, [authResponseData]);

    return (
        <>
            { loading 
            ? (<Loading title="Aguarde, carregando..." />) 
            : (
                <>
                    <div className="card-container">
                        { isVisible && data && Array.isArray(data) ? (
                            data.map((bartender: any) => (
                                <BartenderAuthCard
                                    key={bartender.id}
                                    bartender={bartender}
                                    sendResponseAuthReq={sendResponseAuthReq}
                                />
                            ))
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
    
  export default Admin;