export type User = {
    id: number,
    username: string,
    password: string,
    token: string
};

export const routeTitles: Record<string, string> = {
    '/': 'Comanda digital - Página Inicial',
    '/admin': 'Comanda digital - Área do ADMIN',
    '/queue': 'Comanda digital - Seus pedidos',
    '/login': 'Comanda digital - Login',
};