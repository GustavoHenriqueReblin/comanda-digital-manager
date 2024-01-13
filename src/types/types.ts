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

export enum TypeRedirect {
    ADMIN,
    ROOT
};

export enum TypeOfGet {
    BARTENDER,
    USER
};

export const routeTitles: Record<string, string> = {
    '/': 'Comanda digital - Página Inicial',
    '/admin': 'Comanda digital - Área do ADMIN',
    '/queue': 'Comanda digital - Seus pedidos',
    '/login': 'Comanda digital - Login',
};