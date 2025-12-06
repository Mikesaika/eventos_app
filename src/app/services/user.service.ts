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
    private apiUrl = 'http://localhost:3000/users';

    constructor(
        private http: HttpClient,
        private notificationService: NotificationService
    ) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl).pipe(
            catchError(error => this.handleError(error, 'Error al cargar usuarios'))
        );
    }

    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => this.handleError(error, 'Error al obtener usuario'))
        );
    }

    createUser(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user).pipe(
            tap(() => this.notificationService.show('Usuario creado', 'success')),
            catchError(error => this.handleError(error, 'Error al crear usuario'))
        );
    }

    updateUser(id: string, user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
            tap(() => this.notificationService.show('Usuario actualizado', 'success')),
            catchError(error => this.handleError(error, 'Error al actualizar usuario'))
        );
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.notificationService.show('Usuario eliminado', 'info')),
            catchError(error => this.handleError(error, 'Error al eliminar usuario'))
        );
    }

    // Helper de errores 
    private handleError(error: HttpErrorResponse, message: string) {
        console.error(error);
        this.notificationService.show(message, 'error');
        return throwError(() => error);
    }
}