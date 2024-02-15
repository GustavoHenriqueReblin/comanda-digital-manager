import React, { createContext, useContext, useState } from "react";
import { NavBarItem, NavBarItemsType, User } from "../types/types";
import { GoHomeFill } from "react-icons/go";
import { MdFastfood } from "react-icons/md";
import { useQuery } from "@apollo/client";
import { GetUserByToken } from "../graphql/queries/user";
import Cookies from "js-cookie";

interface AdminAuthContextProps {
    user: User | null;
    adminNavBarItems: NavBarItem[] | [];
    adminItemNavBarSelected: NavBarItemsType | null;
    setAdminItemNavBarSelected: React.Dispatch<React.SetStateAction<NavBarItemsType | null>>;
    isAdminNavBarExpanded: boolean;
    setIsAdminNavBarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

interface AdminAuthProviderProps {
    children: React.ReactNode;
};

const AdminAuthContext = createContext<AdminAuthContextProps>({
    user: {} as User,
    adminNavBarItems: [],
    adminItemNavBarSelected: null,
    setAdminItemNavBarSelected: () => {},
    isAdminNavBarExpanded: false,
    setIsAdminNavBarExpanded: () => {},
});

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
    const [adminItemNavBarSelected, setAdminItemNavBarSelected] = useState<NavBarItemsType | null>(null);
    const [isAdminNavBarExpanded, setIsAdminNavBarExpanded] = useState<boolean>(false);

    const adminNavBarItems: NavBarItem[] = [
        { type: NavBarItemsType.HOME, description: 'Home', icon: <GoHomeFill /> },
        { type: NavBarItemsType.PRODUCTS, description: 'Produtos', icon: <MdFastfood /> },
        //{ type: NavBarItemsType.BARTENDERS, description: 'Garçons', icon: <FaUserAlt /> },
    ];

    const cookieUserName = process.env.REACT_APP_COOKIE_NAME_USER_TOKEN;
    const userToken = Cookies.get(cookieUserName ? cookieUserName : '');  

    const { data } = useQuery(GetUserByToken, {
        variables: { input: { token: userToken } },
    });
    
    if (data && Number(data.getUserByToken.id) === -1) {
        cookieUserName && Cookies.remove(cookieUserName);
        window.location.reload();
    }

    return (
        <AdminAuthContext.Provider value={{
            user: data?.getUserByToken as User, adminNavBarItems, adminItemNavBarSelected, 
            setAdminItemNavBarSelected, isAdminNavBarExpanded, setIsAdminNavBarExpanded
        }}>
            { children }
        </AdminAuthContext.Provider>
    );
};
  
export const useAdminAuthContext = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error(
            "useAdminAuthContext deve ser usado dentro de um AdminAuthContextProvider"
        );
    }
    return context;
};