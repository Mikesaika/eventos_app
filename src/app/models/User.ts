export interface User {
    usuarioID?: number;
    nombre: string;
    email: string;
    passwordHash?: string; 
    rol: 'Administrador' | 'Cliente' | 'Compañía'; // Corregida la tilde si así viene del backend
    telefono: string;
    direccion: string; 
    fechaRegistro: Date | string;
    empresaID?: number; 
    activo: boolean; // CAMBIO: En tu db.json la propiedad es 'activo', no 'active'
}