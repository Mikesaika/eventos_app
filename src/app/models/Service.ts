export interface Service {
    id?: string;
    name: string;
    description: string;
    categoryId: number;
    companyId: number;
    price: number;
    image: string;
    classification: 'plata' | 'oro' | 'diamante' | string;
    active: boolean;
}       