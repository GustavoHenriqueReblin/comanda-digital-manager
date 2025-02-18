/* eslint-disable react-hooks/exhaustive-deps */
import './admin.scss';

import Loading from "../../components/Loading";
import NavBar from '../../components/NavBar/NavBar';
import Header from '../../components/Header/Header';
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import { NavBarItemsType, routes } from "../../types/types";
import { useAdminAuthContext } from '../../contexts/AdminAuthContext';
import { GetBartendersAreWaiting } from "../../graphql/queries/bartender";
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { BARTENDER_AUTH_REQUEST, BARTENDER_AUTH_RESPONSE } from "../../graphql/subscriptions/bartender";

import React, { useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { Helmet } from "react-helmet";
import { UPDATE_USER } from '../../graphql/mutations/user';

function Admin() {
    const [loading, setLoading] = useState<Boolean>(true);
    const [isVisible, setIsVisible] = useState<Boolean>(false);
    const [data, setData] = useState<any>();
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const [updateUser] = useMutation(UPDATE_USER);
   
    const { 
        user, adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
        isAdminNavBarExpanded, setIsAdminNavBarExpanded 
    } = useAdminAuthContext();

    useQuery(GetBartendersAreWaiting, {
        onCompleted: (res) => {
            const data = res.bartendersAreWaiting ? res.bartendersAreWaiting.map((item: any) => item.data) : null;
            setAdminItemNavBarSelected(adminNavBarItems[0].type);
            data && data !== null && setIsVisible(true);
            setData(data);
            setLoading(false);
        },
        onError: (err) => {
            console.error(err);
            setLoading(false);
        }
    });

    useSubscription(BARTENDER_AUTH_REQUEST, {
        onSubscriptionData: (data) => {
            setData(data.subscriptionData.data.authBartenderRequest);
            setIsVisible(true);
        }
    });

    useSubscription(BARTENDER_AUTH_RESPONSE, {
        onSubscriptionData: (data) => {
            setData(data.subscriptionData.data.authBartenderResponse);
            setIsVisible(true);
        }
    });

    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const memoizedData = useMemo(() => {
        return data;
    }, [data]);

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

    const exit = () => {
        const cookieName: string | undefined = process.env.REACT_APP_COOKIE_AUTH_TOKEN_NAME;
        if (cookieName) {
            Cookies.remove(cookieName);
            updateUser({
                variables: {
                    input: {
                        id: user?.id,
                        isWaiting: false,
                        isApproved: false,
                        token: "",
                    },
                },
            });
            navigate('/login');
            window.location.reload();
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
                isExpanded={isAdminNavBarExpanded}
                setIsExpanded={setIsAdminNavBarExpanded}
            ></NavBar>

            <div className='main-content'>
                <Header 
                    id={user?.id}
                    userName={user?.username}
                    exit={exit}
                />
                { loading 
                ? (<Loading title="Aguarde, carregando..." />) 
                : (
                    <>
                        <span>Testando</span>

                        <div className="card-container">
                            { isVisible && memoizedData && Array.isArray(memoizedData) ? (
                                memoizedData.map((bartender: any) => (
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