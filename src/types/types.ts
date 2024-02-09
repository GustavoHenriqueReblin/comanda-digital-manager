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
    bertenderName: string,
    tableId: number,
    value: number,
    date: Date,
    status: number, // 0: Concluído, 1: Resgatado, 2: Confirmado, 3: Finalizado, 4: Cancelado
    items: [OrderItems],
};

export type NavBarItem = {
    type: NavBarItemsType,
    description: string,
    icon: React.ReactNode | undefined,
};

export enum TypeRedirect {
    ADMIN,
    ROOT
};

export enum TypeOfGet {
    BARTENDER,
    USER
};

export enum OrderFilter {
    COMPLETED,
    REDEEMED,
    CONFIRMED,
    FINISHED,
    CANCELED
};

export enum NavBarItemsType {
    HOME,
    PRODUCTS,
    BARTENDERS
};

export const OrderFilterOptions = [
    { id: 1, singularDescription: "Concluído", description: "Concluídos", value: OrderFilter.COMPLETED },
    { id: 2, singularDescription: "Resgatado", description: "Resgatados", value: OrderFilter.REDEEMED },
    { id: 3, singularDescription: "Confirmado", description: "Confirmados", value: OrderFilter.CONFIRMED },
    { id: 4, singularDescription: "Finalizado", description: "Finalizados", value: OrderFilter.FINISHED },
    { id: 5, singularDescription: "Cancelado", description: "Cancelados", value: OrderFilter.CANCELED },
];

export const routeTitles: Record<string, string> = {
    '/': 'Comanda digital - Página Inicial',
    '/admin': 'Comanda digital - Área do ADMIN',
    '/queue': 'Comanda digital - Seus pedidos',
    '/login': 'Comanda digital - Login',
};