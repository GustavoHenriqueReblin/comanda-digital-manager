import './products.scss';

import Header from "../../../components/Header/Header";
import Loading from "../../../components/Loading";
import NavBar from "../../../components/NavBar/NavBar";
import { useAdminAuthContext } from "../../../contexts/AdminAuthContext";
import { UPDATE_USER } from '../../../graphql/mutations/user';
import { NavBarItemsType, routes } from "../../../types/types";

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Cookies from 'js-cookie';
import { useMutation } from '@apollo/client';

interface ProductsProps {
    text: string;
};

function Products({ text }: ProductsProps) {
    const [loading, setLoading] = useState<Boolean>(true);
    
    const { 
        user, adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
        isAdminNavBarExpanded, setIsAdminNavBarExpanded 
    } = useAdminAuthContext();
    const [updateUser] = useMutation(UPDATE_USER);

    const navigate = useNavigate();
    const location = useLocation();
    const currentPage = routes.find(page => page.route === location.pathname);
    const pageTitle = currentPage ? currentPage.title : 'Comanda digital';

    const redirectPageNavBar = (type: NavBarItemsType) => {
        switch (type) {
            case NavBarItemsType.HOME:
                navigate('/admin');
                break;

            case NavBarItemsType.PRODUCTS:
                navigate('/admin/products');
                break;
        
            default:
                break;
        }
    };
    
    const exit = () => {
        const cookieName: string | undefined = process.env.REACT_APP_COOKIE_AUTH_TOKEN_NAME;
        if (cookieName) {
            Cookies.remove(cookieName);
            updateUser({
                variables: {
                    input: {
                        id: user?.id,
                        isWaiting: false,
                        isApproved: false,
                        token: "",
                    },
                },
            });
            navigate('/login');
            window.location.reload();
        }
    };

    setAdminItemNavBarSelected(adminNavBarItems[1].type);
    loading && setLoading(false);    

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <NavBar 
                items={adminNavBarItems}
                itemSelected={adminItemNavBarSelected}
                setItemSelected={setAdminItemNavBarSelected}  
                redirect={(typeClicked) => redirectPageNavBar(typeClicked)}
                isExpanded={isAdminNavBarExpanded}
                setIsExpanded={setIsAdminNavBarExpanded}
            ></NavBar>

            <div className='main-content'>
                <Header 
                    id={user?.id}
                    userName={user?.username}
                    exit={exit}
                />
                { loading 
                ? (<Loading title="Aguarde, carregando..." />) 
                : (
                    <>
                        <h2 className='title'>Gerencie seus produtos: </h2>
                    </>
                )}
            </div>
            
        </>
    )
}

export default Products;