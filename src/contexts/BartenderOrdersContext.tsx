import React, { createContext, useContext } from "react";
import { Order } from "../types/types";

interface BartenderOrdersContextProps {
    data: Order[] | null;
    setData: React.Dispatch<React.SetStateAction<Order[] | null>>;
};

export const BartenderOrdersContext = createContext<BartenderOrdersContextProps>({
    data: null,
    setData: () => {},
});
  
export const useBartenderOrdersContext = () => {
    const context = useContext(BartenderOrdersContext);
    if (!context) {
        throw new Error(
            "useBartenderOrdersContext deve ser usado dentro de um BartenderOrdersContextProvider"
        );
    }
    return context;
};