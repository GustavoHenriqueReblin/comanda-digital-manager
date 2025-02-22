import React, { createContext, useContext } from "react";
import { Bartender } from "../types/types";
import { useQuery } from "@apollo/client";
import { FindBartender } from "../graphql/queries/bartender";
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
    useQuery(FindBartender, {
        onError: (error) => {
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                error.graphQLErrors.forEach(graphQLError => {
                    if (graphQLError.extensions?.code === 'UNAUTHENTICATED') {
                        const cookieUserName = process.env.REACT_APP_COOKIE_AUTH_BARTENDER_TOKEN_NAME;
                        cookieUserName && Cookies.remove(cookieUserName);
                        window.location.reload();
                    }
                });
            }
        },
    });

    return (
        <BartenderAuthContext.Provider value={{ bartenderData: null as unknown as Bartender }}>
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