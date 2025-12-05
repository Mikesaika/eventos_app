import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/Category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Ajusta la URL si usas json-server o endpoint real
  private baseUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) { }

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  get(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(cat: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, cat);
  }

  update(id: number, cat: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, cat);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
