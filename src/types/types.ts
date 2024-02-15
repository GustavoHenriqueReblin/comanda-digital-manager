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

type Page = {
    route: string;
    title: string;
    name: string;
};

export enum TypeRedirect {
    ADMIN,
    ROOT
};

export enum LoginType {
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
    //BARTENDERS
};

export const OrderFilterOptions = [
    { id: 1, singularDescription: "Concluído", description: "Concluídos", value: OrderFilter.COMPLETED },
    { id: 2, singularDescription: "Resgatado", description: "Resgatados", value: OrderFilter.REDEEMED },
    { id: 3, singularDescription: "Confirmado", description: "Confirmados", value: OrderFilter.CONFIRMED },
    { id: 4, singularDescription: "Finalizado", description: "Finalizados", value: OrderFilter.FINISHED },
    { id: 5, singularDescription: "Cancelado", description: "Cancelados", value: OrderFilter.CANCELED },
];

export const routes: Page[] = [
    {route: '/', title: 'Comanda digital - Página Inicial', name: 'Página Inicial' },
    {route: '/admin', title: 'Comanda digital - Painel de controle', name: 'Painel de controle' },
    {route: '/queue', title: 'Comanda digital - Seus pedidos', name: 'Seus pedidos' },
    {route: '/login', title: 'Comanda digital - Login', name: 'Login' },
    {route: '/admin/products', title: 'Comanda digital - Produtos', name: 'Produtos' },
];