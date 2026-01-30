import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajustado a la colección de tu db.json
  private apiUrl = 'http://localhost:5000/Usuarios'; 
  
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // Ajustado para usar email y passwordHash según tu modelo
  login(credentials: { email: string; password: string }): Observable<User> {
    const url = `${this.apiUrl}?email=${credentials.email}&passwordHash=${credentials.password}`;

    return this.http.get<User[]>(url).pipe(
      map(usuarios => {
        // JSON Server devuelve un arreglo; validamos si existe el usuario
        if (usuarios && usuarios.length > 0) {
          const user = usuarios[0];
          
          // Guardamos sesión simulada
          localStorage.setItem('token', 'simulated-jwt-token');
          localStorage.setItem('user', JSON.stringify(user));
          
          this.loggedIn.next(true);
          this.userSubject.next(user);
          return user;
        } else {
          throw new Error('Correo o contraseña incorrectos');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/eventos-list']);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }
}