export type User = {
    id: number,
    username: string,
    password: string,
    token: string
};

export type Bartender = {
    id: number,
    name: string,
    securityCode: string,
    token: string,
    isWaiting: boolean,
    isApproved: boolean
};

export type OrderItems = {
    id: number,
    orderId: number,
    productId: number,
    value: number,
    status: number, // 0: Cancelado, 1: Confirmado
};

export type Order = {
    id: number,
    bartenderId: number,
    tableId: number,
    value: number,
    date: Date,
    status: number, // 0: Concluído, 1: Resgatado, 2: Confirmado, 3: Finalizado
    items: [OrderItems],
};

export enum TypeRedirect {
    ADMIN,
    ROOT
};

export enum TypeOfGet {
    BARTENDER,
    USER
};

enum OrderFilter {
    COMPLETED,
    REDEEMED,
    CONFIRMED
};

export const OrderFilterOptions = [
    { id: 1, description: "Concluídos", value: OrderFilter.COMPLETED },
    { id: 2, description: "Resgatados", value: OrderFilter.REDEEMED },
    { id: 3, description: "Confirmados", value: OrderFilter.CONFIRMED },
];

export const routeTitles: Record<string, string> = {
    '/': 'Comanda digital - Página Inicial',
    '/admin': 'Comanda digital - Área do ADMIN',
    '/queue': 'Comanda digital - Seus pedidos',
    '/login': 'Comanda digital - Login',
};