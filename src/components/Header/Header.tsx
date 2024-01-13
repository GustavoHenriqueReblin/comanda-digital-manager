import React from "react";
import './header.scss';
import { useNavigate } from 'react-router-dom';

function Header() {
    enum TypeRedirect {
        ADMIN,
        ROOT
    };
    const navigate = useNavigate();

    const redirectTo = (typeRedirect: TypeRedirect) => {
        typeRedirect === TypeRedirect.ADMIN ? navigate('/admin') : navigate('/');
    };

    return (
        <>
            <div className="header">
                <div className="logo">
                    <span onClick={() => redirectTo(TypeRedirect.ROOT)} className="title">Carlota’s Kuchen Haus
                        <div className="line"></div>
                    </span>
                </div>
                {/* <div className="menu">
                    <div onClick={() => redirectTo(TypeRedirect.ADMIN)} className="menu-box">
                        <h2>ADMIN</h2>
                    </div>
                </div> */}
            </div>
        </>
    )
}

export default Header;