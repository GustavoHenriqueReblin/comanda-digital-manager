/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import Loading from '../../components/Loading';
import CustomDataTable from '../../components/CustomDataTable/CustomDataTable';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import Modal from '../../components/Modal/Modal';
import Header from '../../components/Header/Header';
import { FormatDate } from '../../helper';
import { Order, OrderFilterOptions, routes, OrderFilter } from "../../types/types";
import { GetOrders } from '../../graphql/queries/order';
import { UPDATE_ORDER } from '../../graphql/mutations/order';
import { UPDATE_TABLE } from '../../graphql/mutations/table';
import { CHANGE_ORDER_STATUS } from "../../graphql/subscriptions/order";
import { UPDATE_BARTENDER } from '../../graphql/mutations/bartender';
import { useBartenderAuthContext } from '../../contexts/BartenderAuthContext';

import React, { useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useSubscription } from '@apollo/client';

function BartenderQueue() {
    enum selectOrderOption {
        CANCEL,
        CONFIRM,
    };
    const [loading, setLoading] = useState<Boolean>(true);
    const [data, setData] = useState<Order[] | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterIndex, setFilterIndex] = useState<string>('0');
    const [isModalCancelOpen, setIsModalCancelOpen] = useState<boolean>(false);
    const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
    const [updateTable] = useMutation(UPDATE_TABLE);
    const [updateOrder] = useMutation(UPDATE_ORDER);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);

    useQuery(GetOrders, {
        variables: { input: { status: [0,1,2,3,4] } },
        onCompleted: (res) => {
            const resData = (res.orders || []).map((order: any) => {
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
            setData(resData);
            setFilterIndex('0');
            setLoading(false);
        },
        onError: (err) => {
            console.error(err);
            setLoading(false);
        }
    });
    
    useSubscription(CHANGE_ORDER_STATUS, {
        onSubscriptionData: (res) => {
            const data = res.subscriptionData.data.ChangeOrderStatus;
            setData(
                (data || []).map((order: any) => {
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
    });

    const navigate = useNavigate();
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
                    bartenderId: bartenderLoggedData?.id ?? selectedOrder.bartenderId,
                    bertenderName: bartenderLoggedData?.name ?? '',
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

    const exit = () => {
        const cookieName: string | undefined = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        if (cookieName) {
            Cookies.remove(cookieName);
            updateBartender({
                variables: {
                    input: {
                        id: bartenderLoggedData?.id,
                        isWaiting: false,
                        isApproved: false,
                        token: "",
                    },
                },
            });
            navigate('/');
            window.location.reload();
        }
    };

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <div className='main-content'>
                <Header 
                    id={bartenderLoggedData?.id}
                    userName={bartenderLoggedData?.name}
                    exit={exit}
                />
                { loading 
                ? (<Loading title="Aguarde, carregando..." />) 
                : (
                    <>
                        <div className="queue-container">
                            <div className="queue-header">
                                <h2 className="title">Seja bem vindo(a) {bartenderLoggedData?.name}!</h2>
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
            </div>
        </>
    )
}

export default BartenderQueue;