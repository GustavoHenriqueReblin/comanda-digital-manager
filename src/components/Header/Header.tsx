/* eslint-disable react-hooks/exhaustive-deps */
import './header.scss';
import Modal from "../Modal/Modal";
import { routes, TypeOfGet, TypeRedirect } from '../../types/types';
import { GetBartenderDataByToken } from '../../graphql/queries/bartender';
import { GetIdByToken } from '../../graphql/queries/user';
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { UPDATE_USER } from "../../graphql/mutations/user";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery, useMutation } from "@apollo/client";
import { CgProfile } from "react-icons/cg";

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const [updateUser] = useMutation(UPDATE_USER);
    const [getBartenderDataByToken] = useLazyQuery(GetBartenderDataByToken);
    const [getIdByTokenQuery] = useLazyQuery(GetIdByToken);
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageName = currentPage ? currentPage.name : 'Comanda digital';

    const redirectTo = (typeRedirect: TypeRedirect) => {
        typeRedirect === TypeRedirect.ADMIN ? navigate('/admin') : navigate('/');
    };

    const getIdByToken = (type: TypeOfGet, token?: string) => {
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
                getIdByTokenQuery({
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
                getIdByToken(TypeOfGet.BARTENDER, token)
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
                getIdByToken(TypeOfGet.USER, token)
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
        if (!isLoggedIn) {
            const cookieBartenderName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
            const bartenderToken = Cookies.get(cookieBartenderName ? cookieBartenderName : '');
            const cookieUserName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
            const userToken = Cookies.get(cookieUserName ? cookieUserName : '');  

            const validateToken = async (type: TypeOfGet, id: number) => {
                const isValidToken = Number(id) > 0;
                if (isValidToken) {
                    setIsLoggedIn(true);
                } else {
                    switch (type) {
                        case TypeOfGet.USER:
                            cookieUserName && Cookies.remove(cookieUserName);
                            navigate('/login');
                            break;

                        case TypeOfGet.BARTENDER:
                            cookieBartenderName && Cookies.remove(cookieBartenderName);
                            navigate('/');
                            break;
                    
                        default:
                            break;
                    }
                }
            };

            if (location.pathname === '/admin') {
                getIdByToken(TypeOfGet.USER, userToken)
                    .then((res) => {validateToken(TypeOfGet.USER, Number(res))});
            } else if (location.pathname === '/queue') {
                getIdByToken(TypeOfGet.BARTENDER, bartenderToken)
                    .then((res) => {validateToken(TypeOfGet.BARTENDER, Number(res))});
            }
        }
    }, [isLoggedIn]);

    return (
        <>
            <div className='header'>
                <div className='page-info'>
                    <h2 className='title'>{ pageName }</h2>
                    <span className='name'>Carlota’s Kuchen Haus</span>
                </div>
                <div className='user-info'>
                    <span className='icon'><CgProfile /></span>
                </div>

                {/* <div className="logo">
                    <span onClick={() => redirectTo(TypeRedirect.ROOT)} className="title">Carlota’s Kuchen Haus
                        <div className="line"></div>
                    </span>
                </div>
                <div className="menu">
                    {isLoggedIn && (
                        // Aqui precisa ser o nome do quem logou bonitinho
                        <button onClick={() => setIsModalExitOpen(true)} className='button' type="button">Sair</button>
                    )}
                </div> */}
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