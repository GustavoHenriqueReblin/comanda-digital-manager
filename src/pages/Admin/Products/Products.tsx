import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar";
import { useAdminContext } from "../../../contexts/AdminContext";
import { NavBarItemsType } from "../../../types/types";

interface ProductsProps {
    text: string;
};

function Products({ text }: ProductsProps) {
    const navigate = useNavigate();
    const { adminNavBarItems, adminItemNavBarSelected, setAdminItemNavBarSelected } = useAdminContext();

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

    return (
        <>
            <NavBar 
                items={adminNavBarItems}
                itemSelected={adminItemNavBarSelected}
                setItemSelected={setAdminItemNavBarSelected}  
                redirect={(typeClicked) => redirectPageNavBar(typeClicked)}
            ></NavBar>
            <span>{ text }</span>
        </>
    )
}

export default Products;