import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/User';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    // Sincronizado con el controlador UsuariosController en C#
    private apiUrl = 'http://localhost:5000/api/Usuarios';

    constructor(
        private http: HttpClient,
        private notificationService: NotificationService
    ) { }

    // Obtener todos los usuarios
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl).pipe(
            catchError(error => this.handleError(error, 'Error al cargar usuarios'))
        );
    }

    // Obtener un usuario por su ID numérico (INT en SQL)
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => this.handleError(error, 'Error al obtener usuario'))
        );
    }

    // Crear usuario omitiendo el ID (Generado automáticamente por IDENTITY en SQL)
    createUser(user: Omit<User, 'usuarioID'>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user).pipe(
            tap(() => this.notificationService.show('Usuario registrado con éxito', 'success')),
            catchError(error => this.handleError(error, 'Error al crear usuario'))
        );
    }

    // Actualizar perfil completo
    updateUser(user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${user.usuarioID}`, user).pipe(
            tap(() => this.notificationService.show('Perfil actualizado correctamente', 'success')),
            catchError(error => this.handleError(error, 'Error al actualizar usuario'))
        );
    }

    // Eliminación lógica o física por ID
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.notificationService.show('Usuario eliminado del sistema', 'info')),
            catchError(error => this.handleError(error, 'Error al eliminar usuario'))
        );
    }

    private handleError(error: HttpErrorResponse, message: string) {
        console.error('Error en UserService:', error);
        this.notificationService.show(message, 'error');
        return throwError(() => error);
    }
}