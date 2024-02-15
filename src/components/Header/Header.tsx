/* eslint-disable react-hooks/exhaustive-deps */
import './header.scss';
import Modal from "../Modal/Modal";
import { routes, TypeRedirect } from '../../types/types';
import { UPDATE_BARTENDER } from "../../graphql/mutations/bartender";
import { UPDATE_USER } from "../../graphql/mutations/user";

import React, { useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from "@apollo/client";
import { CgProfile } from "react-icons/cg";

interface HeaderProps {
    Id?: number;
};

function Header({Id}: HeaderProps) {
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const [updateUser] = useMutation(UPDATE_USER);
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageName = currentPage ? currentPage.name : 'Comanda digital';

    const redirectTo = (typeRedirect: TypeRedirect) => {
        typeRedirect === TypeRedirect.ADMIN ? navigate('/admin') : navigate('/');
    };

    const exit = () => {
        if (location.pathname === '/queue') { // Sair do garçom
            const cookieName: string | undefined = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
            if (cookieName) {
                Cookies.remove(cookieName);
                updateBartender({
                    variables: {
                        input: {
                            id: Id,
                            isWaiting: false,
                            isApproved: false,
                            token: "",
                        },
                    },
                });
                setIsModalExitOpen(false);
                navigate('/');
                window.location.reload();
            }
        } else if (location.pathname === '/admin') { // Sair do usuário
            const cookieName: string | undefined = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
            if (cookieName) {
                Cookies.remove(cookieName);
                updateUser({
                    variables: {
                        input: {
                            id: Id,
                            isWaiting: false,
                            isApproved: false,
                            token: "",
                        },
                    },
                });
                setIsModalExitOpen(false);
                navigate('/login');
                window.location.reload();
            }
        }
    };

    return (
        <>
            <div className='header'>
                <div className='page-info'>
                    <h2 className='title'>{ pageName }</h2>
                    <span className='name'>Carlota’s Kuchen Haus</span>
                </div>
                {(Id && Id > 0) && (
                    <div className='user-info'>
                        <span className='icon'><CgProfile /></span>
                    </div>
                )} 

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