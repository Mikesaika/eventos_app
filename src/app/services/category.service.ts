import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private dataUrl = '/json/data.json';

  constructor(private http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<any>(this.dataUrl).pipe(
      map((data: { categories: any; }) => {
        return data.categories;
      })
    );
  }

  get(id: string): Observable<Category | undefined> {
    return this.http.get<any>(this.dataUrl).pipe(
      map((data: { categories: any[]; }) => {
        return data.categories.find((c: Category) => c.id === id);
      })
    );
  }
}
