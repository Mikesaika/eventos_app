export interface Order {
    ordenID?: number;
    usuarioID: number;
    servicioID: number;
    fechaOrden: Date | string;
    fechaEvento: string;
    precioTotal: number;
    estado: 'Pendiente' | 'Confirmado' | 'Aprobado' | 'Cancelado' | 'Finalizado'; 
    observaciones?: string;
    activo: boolean;
}