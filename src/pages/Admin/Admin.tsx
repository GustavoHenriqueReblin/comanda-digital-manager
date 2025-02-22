/* eslint-disable react-hooks/exhaustive-deps */
import './admin.scss';

import Loading from "../../components/Loading";
import NavBar from '../../components/NavBar/NavBar';
import Header from '../../components/Header/Header';
import BartenderAuthCard from "../../components/BartenderAuthCard/BartenderAuthCard";
import { Bartender, NavBarItemsType, routes } from "../../types/types";
import { useAdminAuthContext } from '../../contexts/AdminAuthContext';
import { GetBartendersAreWaiting } from "../../graphql/queries/bartender";
import { BartenderAccess } from "../../graphql/mutations/bartender";
import { BARTENDER_AUTH_REQUEST } from "../../graphql/subscriptions/bartender";

import React, { useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { Helmet } from "react-helmet";

function Admin() {
    const [loading, setLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [data, setData] = useState<Bartender[] | undefined>(undefined);
    const [bartenderAccess] = useMutation(BartenderAccess);
   
    const { 
        user, adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
        isAdminNavBarExpanded, setIsAdminNavBarExpanded 
    } = useAdminAuthContext();

    const { refetch } = useQuery(GetBartendersAreWaiting, {
        fetchPolicy: 'no-cache',
        onCompleted: (res) => {
            const data = res.bartendersAreWaiting.data as Bartender[];
            setAdminItemNavBarSelected(adminNavBarItems[0].type);
            if (data && data !== null) {
                setIsVisible(true);
                setData(data);
            }
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

    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const memoizedData = useMemo(() => {
        return data;
    }, [data]);

    const sendResponseAuthReq = (bartender: Bartender, approved: boolean) => {
        bartenderAccess({
            variables: {
                input: {
                    bartenderId: Number(bartender.id),
                    response: approved,
                }
            }
        })
            .then(async () => {
                const res = await refetch();
                const data = res.data.bartendersAreWaiting.data as Bartender[];
                if (data && data !== null) {
                    setData(data);
                }
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
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
        const cookieName: string | undefined = process.env.REACT_APP_COOKIE_AUTH_USER_TOKEN_NAME;
        if (cookieName) {
            Cookies.remove(cookieName);
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
                                memoizedData.map((bartender: Bartender) => (
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