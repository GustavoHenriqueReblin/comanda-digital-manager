import React, { createContext, useContext } from "react";
import { NavBarItem, NavBarItemsType } from "../types/types";

interface AdminContextProps {
    adminNavBarItems: NavBarItem[] | [];
    adminItemNavBarSelected: NavBarItemsType | null;
    setAdminItemNavBarSelected: React.Dispatch<React.SetStateAction<NavBarItemsType>>;
};

export const AdminContext = createContext<AdminContextProps>({
    adminNavBarItems: [],
    adminItemNavBarSelected: null,
    setAdminItemNavBarSelected: () => {},
});
  
export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error(
            "useAdminContext deve ser usado dentro de um AdminContextProvider"
        );
    }
    return context;
};