import './products.scss';

import Header from "../../../components/Header/Header";
import Loading from "../../../components/Loading";
import NavBar from "../../../components/NavBar/NavBar";
import { useAdminContext } from "../../../contexts/AdminContext";
import { NavBarItemsType, routeTitles } from "../../../types/types";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

interface ProductsProps {
    text: string;
};

function Products({ text }: ProductsProps) {
    const [loading, setLoading] = useState<Boolean>(true);
    const navigate = useNavigate();
    const location = useLocation();
    const pageTitle = routeTitles[location.pathname] || 'Comanda digital';
    const { 
        adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected, 
        isAdminNavBarExpanded, setIsAdminNavBarExpanded 
    } = useAdminContext();

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

    useEffect(() => {
        setAdminItemNavBarSelected(adminNavBarItems[1].type);
        setLoading(false);    
    });

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
                <Header />
                { loading 
                ? (<Loading title="Aguarde, carregando..." />) 
                : (
                    <>
                        <span>{ text }</span>
                    </>
                )}
            </div>
            
        </>
    )
}

export default Products;