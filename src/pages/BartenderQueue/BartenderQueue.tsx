/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import React, { useEffect, useState } from "react";
import Loading from '../../components/Loading';
import CustomDataTable from '../../components/CustomDataTable/CustomDataTable';

import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Order, OrderFilterOptions, routeTitles } from "../../types/types";
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { useLazyQuery, useSubscription } from '@apollo/client';
import { GetOrders } from '../../graphql/queries/order';
import { CHANGE_ORDER_STATUS } from "../../graphql/subscriptions/order";
import { FormatDate } from '../../helper';
import CustomSelect from '../../components/CustomSelect/CustomSelect';

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

    const tableOrderColumns = [
        {
            name: 'Código da mesa',
            selector: (row: any) => row.tableCode,
            width: "190px"  
        },
        {
            name: 'Valor total',
            selector: (row: any) => {
                return Number(row.value).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                });
            },
            width: "160px"  
        },
        {
            name: 'Data',
            selector: (row: any) => {return FormatDate(row.date)},
            width: "160px"  
        },
        {
            name: 'Status',
            selector: (row: any) => {
                switch (row.status) {
                    case 0:
                        return 'Concluído';

                    case 1:
                        return 'Resgatado';

                    case 2:
                        return 'Confirmado';

                    case 3:
                        return 'Finalizado';
                
                    default:
                        break;
                }
                
            },
            width: "140px"  
        },
        {
            name: 'Opções',
            selector: () => {
                return (
                    <>
                        <button className='button confirm'>Confirmar</button>
                        <button className='button cancel'>Cancelar</button>
                    </>
                )
            },
        },
    ];

    const tableOrderStyle = {
        headCells: {
            style: {
                fontSize: "18px",
                fontWeight: "900",
            }
        },
        rows: {
            style: {
                fontSize: "16px",
            }
        },
    };

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

    const handleFilterSelect = (newFilterIndex: string) => {
        setFilterIndex(newFilterIndex);
    };

    return (
        <>
            { loading 
            ? (<Loading title="Aguarde, carregando..." />) 
            : (
                <>
                    <Helmet>
                        <title>{pageTitle}</title>
                    </Helmet>
                    <div className="queue-container">
                        <div className="queue-header">
                            <h2 className="title">Seja bem vindo(a) {name}!</h2>
                            <CustomSelect 
                                options={OrderFilterOptions} 
                                onClickFilter={handleFilterSelect}
                            />
                        </div>
                        <div className="queue-main">
                            { data && data.length > 0 ? (
                                <CustomDataTable
                                    columns={tableOrderColumns}
                                    data={data.filter((order) => order.status === Number(filterIndex))}
                                    customStyles={tableOrderStyle}
                                    noDataMessage='Sem pedidos com o status selecionado :('
                                    defaultSortFieldId={2}
                                    defaultSortAsc
                                ></CustomDataTable>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default BartenderQueue;