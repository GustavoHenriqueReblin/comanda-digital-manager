import React, { createContext, useContext } from "react";
import { Bartender } from "../types/types";
import { useQuery } from "@apollo/client";
import { GetBartenderDataByToken } from "../graphql/queries/bartender";
import Cookies from "js-cookie";

interface BartenderAuthContextProps {
    bartenderData: Bartender | null;
};

interface BartenderAuthProviderProps {
    children: React.ReactNode;
};

const BartenderAuthContext = createContext<BartenderAuthContextProps>({
    bartenderData: {} as Bartender,
});

export const BartenderAuthProvider: React.FC<BartenderAuthProviderProps> = ({ children }) => {
    const cookieBartenderName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
    const bartenderToken = Cookies.get(cookieBartenderName ? cookieBartenderName : '');  

    const { data } = useQuery(GetBartenderDataByToken, {
        variables: { input: { securityCode: "-1", token: bartenderToken } },
    });

    if (data && (data.getBartenderByToken.data === null || Number(data.getBartenderByToken.data.id) === -1)) {
        cookieBartenderName && Cookies.remove(cookieBartenderName);
        window.location.reload();
    }

    return (
        <BartenderAuthContext.Provider value={{ bartenderData: data?.getBartenderByToken?.data as Bartender }}>
            { children }
        </BartenderAuthContext.Provider>
    );
};
  
export const useBartenderAuthContext = () => {
    const context = useContext(BartenderAuthContext);
    if (!context) {
        throw new Error(
            "useBartenderAuthContext deve ser usado dentro de um BartenderAuthContextProvider"
        );
    }
    return context;
};