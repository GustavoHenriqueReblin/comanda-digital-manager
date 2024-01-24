import { format, isToday, isYesterday } from 'date-fns';

export const FormatDate = (date: string) => {
    if (isToday(date)) {
        const hour = format(date, 'HH:mm:ss');
        return `Hoje ${hour}`;
    } else if (isYesterday(date)) {
        const hour = format(date, 'HH:mm:ss');
        return `Ontem ${hour}`;
    } else {
        return format(date, 'dd-MM-yyyy HH:mm:ss');
    };
};