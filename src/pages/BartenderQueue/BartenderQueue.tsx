/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Order, OrderFilterOptions, routeTitles } from "../../types/types";
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { useLazyQuery, useSubscription } from '@apollo/client';
import Loading from '../../components/Loading';
import { GetOrders } from '../../graphql/queries/order';
import { BartenderOrdersContext } from '../../contexts/BartenderOrdersContext';
import { CHANGE_ORDER_STATUS } from "../../graphql/subscriptions/order";

function BartenderQueue() {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<Boolean>(true);
    const [data, setData] = useState<Order[] | null>(null);
    const [filterIndex, setFilterIndex] = useState<string>('0');

    const { data: OrdersData } = useSubscription(CHANGE_ORDER_STATUS);
    const [getBartenderDataByToken, { data: bartenderData }] = useLazyQuery(GetBartenderDataByToken);
    const [getOrdersData, { data: ordersData }] = useLazyQuery(GetOrders);

    const location = useLocation();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

    useEffect(() => { 
        if (!bartenderData) {
            const fetchBartenderData = async () => {
                const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
                if (cookieName) {
                    const token = Cookies.get(cookieName); 
                    return new Promise((resolve, reject) => {
                        getBartenderDataByToken({
                            variables: { input: { securityCode: "-1", token: token } },
                        })
                            .then(res => {
                                resolve(res.data.getDataByToken.data.name);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                }
            };

            const fetchOrdersData = async () => {
                if (!ordersData) {
                    return new Promise((resolve, reject) => {
                        getOrdersData({
                            variables: { input: { status: [0,1,2] } },
                        })
                            .then(res => {
                                resolve(res.data.orders);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                }
            };

            fetchBartenderData()
                .then((data) => {
                    setName(data as string);
                    return fetchOrdersData();
                })
                .then((data) => {
                    setFilterIndex('0');
                    setData(data as Order[]);
                    setLoading(false);
                })
                .catch((bartenderError) => {
                    console.error("Erro ao buscar os dados do garçom:", bartenderError);
                })
                .catch((ordersError) => {
                    console.error("Erro ao buscar os pedidos:", ordersError);
                });
        }
    }, [bartenderData]);

    useEffect(() => { 
        if (OrdersData) {
            setData(
                (OrdersData?.ChangeOrderStatus || []).map((order: any) => {
                    return {
                        ...order.data,
                    } as Order;
                })
            );
        }
    }, [OrdersData]);

    const handleFilterSelect = (event: any) => {
        setFilterIndex(event.target.value);
    };

    return (
        <>
            { loading 
            ? (<Loading title="Aguarde, carregando..." />) 
            : (
                <>
                    <BartenderOrdersContext.Provider value={
                        { data, setData }
                    }>
                        <Helmet>
                            <title>{pageTitle}</title>
                        </Helmet>
                        <div className="queue-container">
                            <div className="queue-header">
                                <h2 className="title">Seja bem vindo(a) {name}!</h2>
                                <select id="filter-order" onClick={handleFilterSelect}>
                                    {OrderFilterOptions.map(option => (
                                        <option key={option.id} value={option.value}>
                                            {option.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="queue-main">
                                { data && data.length > 0 ? (
                                    <span>
                                        {JSON.stringify(data.filter((order) => order.status === Number(filterIndex)))}
                                    </span>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>
                    </BartenderOrdersContext.Provider>
                </>
            )}
        </>
    )
}

export default BartenderQueue;