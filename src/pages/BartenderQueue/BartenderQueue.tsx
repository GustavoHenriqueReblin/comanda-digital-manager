/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import Loading from '../../components/Loading';
import CustomDataTable from '../../components/CustomDataTable/CustomDataTable';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import { Order, OrderFilterOptions, routes, Bartender, OrderFilter } from "../../types/types";
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { GetOrders } from '../../graphql/queries/order';
import { UPDATE_ORDER } from '../../graphql/mutations/order';
import { UPDATE_TABLE } from '../../graphql/mutations/table';
import { CHANGE_ORDER_STATUS } from "../../graphql/subscriptions/order";
import { useBartenderAuthContext } from '../../contexts/BartenderAuthContext';

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { FormatDate } from '../../helper';

function BartenderQueue() {
    enum selectOrderOption {
        CANCEL,
        CONFIRM,
    };
    const [bartender, setBartender] = useState<Bartender | null>(null);
    const [loading, setLoading] = useState<Boolean>(true);
    const [data, setData] = useState<Order[] | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterIndex, setFilterIndex] = useState<string>('0');
    const [isModalCancelOpen, setIsModalCancelOpen] = useState<boolean>(false);
    const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);

    const { data: subscriptionOrdersData } = useSubscription(CHANGE_ORDER_STATUS);
    const [getBartenderDataByToken, { data: bartenderData }] = useLazyQuery(GetBartenderDataByToken);
    const [getOrdersData, { data: ordersData }] = useLazyQuery(GetOrders);
    const [updateTable] = useMutation(UPDATE_TABLE);
    const [updateOrder] = useMutation(UPDATE_ORDER);

    const location = useLocation();
    const { bartenderData: bartenderLoggedData } = useBartenderAuthContext();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const tableOrderColumns = [
        {
            id: 1,
            name: 'Cód. do pedido',
            field: 'id',
        },
        {
            id: 2,
            name: 'Cód. da mesa',
            field: 'tableCode',
        },
        {
            id: 3,
            name: 'Valor total',
            field: 'value',
        },
        {
            id: 4,
            name: 'Data',
            field: 'date',
        },
        {
            id: 5,
            name: 'Garçom',
            field: 'bertenderName',
        },
        {
            id: 6,
            name: 'Status',
            field: 'statusName',
        },
        {
            id: 7,
            name: 'Opções',
            field: 'null',
        },
    ];

    const handleFilterSelect = (newFilterIndex: string) => {
        setFilterIndex(newFilterIndex);
    };

    const selectOrder = (order: Order, option: selectOrderOption) => {
        setSelectedOrder(order);
        switch (option) {
            case selectOrderOption.CONFIRM:
                setIsModalConfirmOpen(true);
                break;

            case selectOrderOption.CANCEL:
                setIsModalCancelOpen(true);
                break;
        
            default:
                break;
        }
    };

    const updateOrderStatus = (option: selectOrderOption) => {
        selectedOrder && selectedOrder !== null && updateOrder({
            variables: {
                input: {
                    id: selectedOrder.id,
                    bartenderId: bartender?.id ?? selectedOrder.bartenderId,
                    bertenderName: bartender?.name ?? '',
                    status: (() => {
                        switch (option) {
                            case selectOrderOption.CONFIRM:
                                setIsModalConfirmOpen(false);
                                return 1;
    
                            case selectOrderOption.CANCEL:
                                setIsModalCancelOpen(false);
                                return 4;
    
                            default:
                                break;
                        }
                    })(),
                },
            },
        }).catch((error) => {
            console.error("Erro ao atualizar o pedido: ", error);
            setSelectedOrder(null);
        }).then(() => {
            option === selectOrderOption.CANCEL && freeTable(Number(selectedOrder.tableId));
            setSelectedOrder(null);
        });
    };

    const freeTable = (tableId: number) => {
        updateTable({
            variables: {
                input: {
                    id: tableId,
                    code: -1,
                    state: true,
                },
            },
        }).catch((error) => {
            console.error("Erro ao liberar a mesa: ", error);
            setSelectedOrder(null);
        }).then(() => {
            setSelectedOrder(null);
        });
    };

    const getOrderStatusName = (status: OrderFilter) => {
        switch (status) {
            case OrderFilter.COMPLETED:
                return OrderFilterOptions[OrderFilter.COMPLETED].singularDescription;

            case OrderFilter.REDEEMED:
                return OrderFilterOptions[OrderFilter.REDEEMED].singularDescription;

            case OrderFilter.CONFIRMED:
                return OrderFilterOptions[OrderFilter.CONFIRMED].singularDescription;

            case OrderFilter.FINISHED:
                return OrderFilterOptions[OrderFilter.FINISHED].singularDescription;

            case OrderFilter.CANCELED:
                return OrderFilterOptions[OrderFilter.CANCELED].singularDescription;
        
            default:
                break;
        }
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
                                resolve(res.data.getBartenderByToken.data);
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
                            variables: { input: { status: [0,1,2,3,4] } },
                        })
                            .then(res => {
                                const resData = (res.data.orders || []).map((order: any) => {
                                    return {
                                        ...order,
                                        value: Number(order.value).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }),
                                        date: FormatDate(order.date),
                                        statusName: getOrderStatusName(order.status)
                                    } as Order;
                                });
                                resolve(resData);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                }
            };

            fetchBartenderData()
                .then((data) => {
                    setBartender(data as Bartender);
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
        if (subscriptionOrdersData) {
            setData(
                (subscriptionOrdersData?.ChangeOrderStatus || []).map((order: any) => {
                    return {
                        ...order.data,
                        value: Number(order.data.value).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        }),
                        date: FormatDate(order.data.date),
                        statusName: getOrderStatusName(order.data.status)
                    } as Order;
                })
            );
        }
    }, [subscriptionOrdersData]);

    return (
        <>
            { loading 
            ? (<Loading title="Aguarde, carregando..." />) 
            : (
                <>
                    <Helmet>
                        <title>{pageTitle}</title>
                    </Helmet>
                    <div className='main-content'>
                        <Header Id={bartenderLoggedData?.id} />
                        <div className="queue-container">
                            <div className="queue-header">
                                <h2 className="title">Seja bem vindo(a) {bartender?.name}!</h2>
                                <CustomSelect 
                                    options={OrderFilterOptions} 
                                    onClickFilter={handleFilterSelect}
                                />
                            </div>
                            <div className="queue-main">
                                <CustomDataTable
                                    columns={tableOrderColumns}
                                    data={data?.filter((order) => order.status === Number(filterIndex))}
                                    noDataMessage='Sem pedidos com o status selecionado :('
                                    buttonsOptions={true}
                                    onConfirm={(order) => { order.status === 0 && selectOrder(order, selectOrderOption.CONFIRM) }}
                                    onCancel={(order) => { order.status === 0 && selectOrder(order, selectOrderOption.CANCEL) }}
                                ></CustomDataTable>
                            </div>
                        </div>
                    </div>

                    <Modal 
                        title={"Deseja realmente cancelar o pedido?"}
                        isOpen={isModalCancelOpen} 
                        onClose={() => {setIsModalCancelOpen(false)}} 
                        onConfirm={() => updateOrderStatus(selectOrderOption.CANCEL)}
                    />

                    <Modal 
                        title={"Deseja realmente confirmar o pedido?"}
                        isOpen={isModalConfirmOpen} 
                        onClose={() => {setIsModalConfirmOpen(false)}} 
                        onConfirm={() => updateOrderStatus(selectOrderOption.CONFIRM)}
                    />
                </>
            )}
        </>
    )
}

export default BartenderQueue;