/* eslint-disable react-hooks/exhaustive-deps */
import Modal from "../../components/Modal/Modal";
import './bartenderQueue.scss';

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation } from "@apollo/client";
import { UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { routeTitles } from "../../types/types";

function BartenderQueue() {
    const [name, setName] = useState<string>("");
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const navigate = useNavigate();
    const location = useLocation();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';

    const exit = () => {
        let cookieName;
        let id;

        cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_DATA;
        if (cookieName) {
            const bartender = Cookies.get(cookieName);  
            if (bartender) {
                const bartenderObj = JSON.parse(bartender);
                // Futuramente ajustar para pegar esse id do token
                id = bartenderObj.id;
              }
            Cookies.remove(cookieName);
        }

        cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        if (cookieName) {
            Cookies.remove(cookieName);
        }

        updateBartender({
            variables: {
              input: {
                id: id,
                isWaiting: false,
                isApproved: false,
                token: "",
              },
            },
        });

        navigate('/');
    }

    useEffect(() => { 
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_DATA;
        const bartender = Cookies.get(cookieName ? cookieName : '');  
        if (bartender) {
            const bartenderObj = JSON.parse(bartender);
            setName(bartenderObj.name);   
        }
    });

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <div className="queue-container">
                <div className="queue-header">
                    <h2 className="title">Seja bem vindo(a) {name}!</h2>
                    <button onClick={() => setIsModalExitOpen(true)} className='button' type="button">Sair</button>
                </div>
                <div className="queue-main">
                    
                </div>

                <Modal 
                    title={"Deseja realmente sair?"}
                    isOpen={isModalExitOpen} 
                    onClose={() => {setIsModalExitOpen(false)}} 
                    onConfirm={() => exit()}
                />
            </div>
        </>
    )
}

export default BartenderQueue;