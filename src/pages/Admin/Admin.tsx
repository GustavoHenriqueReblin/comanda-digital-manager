/* eslint-disable react-hooks/exhaustive-deps */
import './admin.scss';

import Loading from "../../components/Loading";
import NavBar from '../../components/NavBar/NavBar';
import Header from '../../components/Header/Header';
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import { NavBarItem, NavBarItemsType, routeTitles } from "../../types/types";
import { GetBartendersAreWaiting } from "../../graphql/queries/bartender";
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { BARTENDER_AUTH_REQUEST, BARTENDER_AUTH_RESPONSE } from "../../graphql/subscriptions/bartender";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { Helmet } from "react-helmet";
import { GoHomeFill } from "react-icons/go";
import { MdFastfood } from "react-icons/md";
import { FaUserAlt } from "react-icons/fa";

function Admin() {
    const [loading, setLoading] = useState<Boolean>(true);
    const [isVisible, setIsVisible] = useState<Boolean>(false);
    const [data, setData] = useState<any>();
    const [getBartendersAreWaiting] = useLazyQuery(GetBartendersAreWaiting);
    const { data: authRequestData } = useSubscription(BARTENDER_AUTH_REQUEST);
    const { data: authResponseData } = useSubscription(BARTENDER_AUTH_RESPONSE);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const location = useLocation();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

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

    const navBarItems: NavBarItem[] = [
        { type: NavBarItemsType.HOME, description: 'Home', icon: <GoHomeFill /> },
        { type: NavBarItemsType.PRODUCTS, description: 'Produtos', icon: <MdFastfood /> },
        { type: NavBarItemsType.BARTENDERS, description: 'Garçons', icon: <FaUserAlt /> },
    ];

    return (
        <>
            { loading 
            ? (<Loading title="Aguarde, carregando..." />) 
            : (
                <>
                    <Helmet>
                        <title>{pageTitle}</title>
                    </Helmet>
                    <NavBar items={navBarItems}  />

                    <div className='main-content'>
                        <Header />
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
                    </div>
                </>
            )}
        </>
    );
}
    
  export default Admin;