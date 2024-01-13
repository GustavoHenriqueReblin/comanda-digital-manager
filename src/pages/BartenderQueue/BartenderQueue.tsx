/* eslint-disable react-hooks/exhaustive-deps */
import './bartenderQueue.scss';

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { routeTitles } from "../../types/types";
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { useLazyQuery } from '@apollo/client';
import Loading from '../../components/Loading';

function BartenderQueue() {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<Boolean>(true);
    const [getBartenderDataByToken, { data: bartenderData }] = useLazyQuery(GetBartenderDataByToken);
    const location = useLocation();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

    useEffect(() => { 
        if (!bartenderData) {
            const fetchData = async () => {
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

            fetchData()
                .then(data => {
                    setName(data as string);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erro ao buscar os dados do garçom:", error);
                });
        }
    }, [bartenderData]);

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
                        </div>
                        <div className="queue-main">
                            
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default BartenderQueue;