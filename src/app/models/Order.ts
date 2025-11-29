export interface Order {
    id?: string;
    userId: number;
    serviceId: number;
    date: string;
    total: number;
    active: boolean;
}