/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import Loading from '../../components/Loading';
import CustomDataTable from '../../components/CustomDataTable/CustomDataTable';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import Modal from '../../components/Modal/Modal';
import { FormatDate } from '../../helper';
import { Order, OrderFilterOptions, routeTitles, Bartender, OrderFilter } from "../../types/types";
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { GetOrders } from '../../graphql/queries/order';
import { UPDATE_ORDER } from '../../graphql/mutations/order';
import { UPDATE_TABLE } from '../../graphql/mutations/table';
import { CHANGE_ORDER_STATUS } from "../../graphql/subscriptions/order";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';

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
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

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
                    bartenderId: selectedOrder.bartenderId,
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

    const tableOrderColumns = [
        {
            name: 'Código do pedido',
            selector: (row: any) => row.id,
            width: "180px"  
        },
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
            width: "160px",
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
                    case OrderFilter.COMPLETED:
                        return OrderFilterOptions[OrderFilter.COMPLETED].description;

                    case OrderFilter.REDEEMED:
                        return OrderFilterOptions[OrderFilter.REDEEMED].description;

                    case OrderFilter.CONFIRMED:
                        return OrderFilterOptions[OrderFilter.CONFIRMED].description;

                    case OrderFilter.FINISHED:
                        return OrderFilterOptions[OrderFilter.FINISHED].description;

                    case OrderFilter.CANCELED:
                        return OrderFilterOptions[OrderFilter.CANCELED].description;
                
                    default:
                        break;
                }
                
            },
            width: "140px"  
        },
        {
            name: 'Opções',
            selector: (row: any) => {
                return (
                    <div className='table-options'>
                        <button className={`button confirm ${row.status !== 0 && 'disabled'}`} 
                            onClick={() => row.status === 0 && selectOrder(row, selectOrderOption.CONFIRM)}>
                            Confirmar
                        </button>
                        <button className={`button cancel ${row.status !== 0 && 'disabled'}`}
                            onClick={() => row.status === 0 && selectOrder(row, selectOrderOption.CANCEL)}>
                            Cancelar
                        </button>
                    </div>
                )
            },
        },
    ];

    const tableOrderStyle = {
        headRow: {
            style: {
                borderRadius: "4px",
                backgroundColor: "#b6cde0",
                border: 'none',
                marginBottom: '6px',
            }
        },
        headCells: {
            style: {
                fontSize: "18px",
                fontWeight: "900",
                cursor: 'pointer',
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
                                resolve(res.data.getDataByToken.data);
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
                    } as Order;
                })
            );
        }
    }, [subscriptionOrdersData]);

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
                            <h2 className="title">Seja bem vindo(a) {bartender?.name}!</h2>
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