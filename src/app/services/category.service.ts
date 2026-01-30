import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Ajusta la URL a la de tu API en .NET (normalmente puerto 5000 o 7000)
  private baseUrl = 'http://localhost:5000/api/categorias'; 

  constructor(private http: HttpClient) { }

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  // Se cambia el ID estrictamente a number para coincidir con SQL Server
  get(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  // Usamos categoriaID para mantener la consistencia con el modelo actualizado
  update(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${category.categoriaID}`, category);
  }

  // Cambiado de string|number a solo number
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}