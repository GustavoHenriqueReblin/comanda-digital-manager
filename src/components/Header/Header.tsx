/* eslint-disable react-hooks/exhaustive-deps */
import './header.scss';
import Modal from "../Modal/Modal";
import { TypeOfGet, TypeRedirect } from '../../types/types';
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { GetIdByToken } from '../../graphql/queries/user';
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { UPDATE_USER } from "../../graphql/mutations/user";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery, useMutation } from "@apollo/client";

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const [updateUser] = useMutation(UPDATE_USER);
    const [getBartenderDataByToken] = useLazyQuery(GetBartenderDataByToken);
    const [getIdByToken] = useLazyQuery(GetIdByToken);

    const redirectTo = (typeRedirect: TypeRedirect) => {
        typeRedirect === TypeRedirect.ADMIN ? navigate('/admin') : navigate('/');
    };

    const getId = (type: TypeOfGet, token?: string) => {
        if (type === TypeOfGet.BARTENDER) {
            return new Promise((resolve, reject) => {
                getBartenderDataByToken({
                    variables: { input: { securityCode: "-1", token: token } },
                })
                    .then(res => {
                        resolve(res.data ? res.data.getDataByToken.data.id : null);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        } else {
            return new Promise((resolve, reject) => {
                getIdByToken({
                    variables: { input: { token: token } },
                })
                    .then(res => {
                        resolve(res.data ? res.data.getIdByToken : null);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
    };

    const exit = () => {
        if (location.pathname === '/queue') { // Sair do garçom
            const cookieName: string | undefined = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
            if (cookieName) {
                const token = Cookies.get(cookieName);
                Cookies.remove(cookieName);
                getId(TypeOfGet.BARTENDER, token)
                    .then((data) => {
                        if (data && data !== null && Number(data) > 0) {
                            updateBartender({
                                variables: {
                                    input: {
                                        id: Number(data),
                                        isWaiting: false,
                                        isApproved: false,
                                        token: "",
                                    },
                                },
                            });
                        }
                        setIsModalExitOpen(false);
                        navigate('/');
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar o garçom:", error);
                    });
            }
        } else if (location.pathname === '/admin') { // Sair do usuário
            const cookieName: string | undefined = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
            if (cookieName) {
                const token = Cookies.get(cookieName); 
                Cookies.remove(cookieName);
                getId(TypeOfGet.USER, token)
                    .then((data) => {
                        if (data && data !== null && Number(data) > 0) {
                            updateUser({
                                variables: {
                                    input: {
                                        id: Number(data),
                                        isWaiting: false,
                                        isApproved: false,
                                        token: "",
                                    },
                                },
                            });
                        }
                        setIsModalExitOpen(false);
                        navigate('/login');
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.error("Erro ao buscar o usuário:", error);
                    });
            }
        }
    };

    useEffect(() => { 
        const cookieBartenderName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        const bartender = Cookies.get(cookieBartenderName ? cookieBartenderName : '');  
        const cookieUserName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
        const user = Cookies.get(cookieUserName ? cookieUserName : ''); 

        const hasBartenderLoggedIn = !!bartender && location.pathname === '/queue';
        const hasUserLoggedIn = !!user && location.pathname === '/admin';

        setIsLoggedIn(hasBartenderLoggedIn || hasUserLoggedIn); 
    });

    return (
        <>
            <div className="header">
                <div className="logo">
                    <span onClick={() => redirectTo(TypeRedirect.ROOT)} className="title">Carlota’s Kuchen Haus
                        <div className="line"></div>
                    </span>
                </div>
                <div className="menu">
                    {/* <div onClick={() => redirectTo(TypeRedirect.ADMIN)} className="menu-box">
                        <h2>ADMIN</h2>
                    </div> */}
                    {isLoggedIn && (
                        <button onClick={() => setIsModalExitOpen(true)} className='button' type="button">Sair</button>
                    )}
                </div>
            </div>

            <Modal 
                title={"Deseja realmente sair?"}
                isOpen={isModalExitOpen} 
                onClose={() => {setIsModalExitOpen(false)}} 
                onConfirm={() => exit()}
            />
        </>
    )
}

export default Header;