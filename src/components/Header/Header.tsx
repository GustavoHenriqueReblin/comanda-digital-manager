/* eslint-disable react-hooks/exhaustive-deps */
import './header.scss';
import Modal from "../Modal/Modal";
import { routes } from '../../types/types';

import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { IoIosArrowDown } from "react-icons/io";

interface HeaderProps {
    id?: number;
    userName?: string;
    exit?: () => void;
};

function Header({ id, userName, exit }: HeaderProps) {
    const [isModalExitOpen, setIsModalExitOpen] = useState<boolean>(false);
    const [isExitOptionOpen, setIsExitOptionOpen] = useState<boolean>(false);

    const location = useLocation();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageName = currentPage ? currentPage.name : 'Comanda digital';

    return (
        <>
            <div className='header'>
                <div className='page-info'>
                    <h2 className='title'>{ pageName }</h2>
                    <span className='name'>Carlota’s Kuchen Haus</span>
                </div>
                {(id && id > 0) && (
                    <div className='user-info'>
                        <span className='icon'><CgProfile /></span>
                        <div className={`exit ${isExitOptionOpen && 'underline'}`} onClick={() => setIsExitOptionOpen(!isExitOptionOpen)}>
                            <span className='username'>{ userName }</span>
                            <span className='arrow'><IoIosArrowDown /></span>
                            { isExitOptionOpen && (
                                <div className="exit-option" onClick={() => setIsModalExitOpen(true)}>
                                    <span>Sair</span>
                                </div>
                            )}
                        </div>
                    </div>
                )} 
            </div>

            <Modal 
                title={"Deseja realmente sair?"}
                isOpen={isModalExitOpen} 
                onClose={() => {setIsModalExitOpen(false)}} 
                onConfirm={() => exit && exit()}
            />
        </>
    )
}

export default Header;