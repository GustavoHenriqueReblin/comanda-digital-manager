/* eslint-disable react-hooks/exhaustive-deps */
import Modal from "../../components/Modal/Modal";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useMutation } from "@apollo/client";
import { UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import { useNavigate } from "react-router-dom";

function BartenderQueue() {
    const [name, setName] = useState<string>("");
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const navigate = useNavigate();

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
            <h1>Seja bem vindo {name}!</h1>
            <button onClick={() => setIsModalExitOpen(true)} className='button' type="button">Sair</button>

            <Modal 
                title={"Deseja realmente sair?"}
                isOpen={isModalExitOpen} 
                onClose={() => {setIsModalExitOpen(false)}} 
                onConfirm={() => exit()}
            />
        </>
    )
}

export default BartenderQueue;