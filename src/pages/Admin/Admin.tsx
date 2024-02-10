/* eslint-disable react-hooks/exhaustive-deps */
import './admin.scss';

import Loading from "../../components/Loading";
import NavBar from '../../components/NavBar/NavBar';
import Header from '../../components/Header/Header';
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import { NavBarItemsType, routeTitles } from "../../types/types";
import { useAdminContext } from '../../contexts/AdminContext';
import { GetBartendersAreWaiting } from "../../graphql/queries/bartender";
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { BARTENDER_AUTH_REQUEST, BARTENDER_AUTH_RESPONSE } from "../../graphql/subscriptions/bartender";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { Helmet } from "react-helmet";

function Admin() {
    const [loading, setLoading] = useState<Boolean>(true);
    const [isVisible, setIsVisible] = useState<Boolean>(false);
    const [data, setData] = useState<any>();
    const [getBartendersAreWaiting] = useLazyQuery(GetBartendersAreWaiting);
    const { data: authRequestData } = useSubscription(BARTENDER_AUTH_REQUEST);
    const { data: authResponseData } = useSubscription(BARTENDER_AUTH_RESPONSE);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const location = useLocation();
    const navigate = useNavigate();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';
    const { adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected } = useAdminContext();

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
                    setAdminItemNavBarSelected(adminNavBarItems[0].type);
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

    const redirectPageNavBar = (type: NavBarItemsType) => {
        switch (type) {
            case NavBarItemsType.HOME:
                navigate('/admin');
                break;

            case NavBarItemsType.PRODUCTS:
                navigate('/admin/products');
                break;
        
            default:
                break;
        }
    };

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <NavBar 
                items={adminNavBarItems}
                itemSelected={adminItemNavBarSelected}
                setItemSelected={setAdminItemNavBarSelected}  
                redirect={(typeClicked) => redirectPageNavBar(typeClicked)}
            ></NavBar>

            <div className='main-content'>
                { loading 
                ? (<Loading title="Aguarde, carregando..." />) 
                : (
                    <>
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
                    </>
                )}
            </div>
        </>
    );
}
    
  export default Admin;