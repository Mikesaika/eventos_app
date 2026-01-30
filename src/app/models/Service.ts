export interface Service {
    servicioID?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenURL: string;
    clasificacion: string;
    categoriaID: number;
    empresaID: number;
    activo: boolean;
}