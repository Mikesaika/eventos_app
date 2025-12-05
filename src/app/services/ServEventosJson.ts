import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { Category } from '../models/Category';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root',
})
export class ServEventosJson {
    private baseUrl = 'http://localhost:3000';

    private servicesUrl = `${this.baseUrl}/services`;
    private categoriesUrl = `${this.baseUrl}/categories`;
    private companiesUrl = `${this.baseUrl}/companies`;
    private usersUrl = `${this.baseUrl}/users`;
    private ordersUrl = `${this.baseUrl}/orders`;

    constructor(private http: HttpClient) { }

    //  SERVICES 
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }

    getServiceById(id: string): Observable<Service> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.get<Service>(url);
    }

    // CATEGORIES 
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    //  COMPANIES 
    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }

    // USERS 
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.usersUrl);
    }


    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.usersUrl}/${id}`);
    }

    createUser(user: Omit<User, 'id'>): Observable<User> {
        return this.http.post<User>(this.usersUrl, user);
    }

    updateUser(id: string, user: User): Observable<User> {
        return this.http.put<User>(`${this.usersUrl}/${id}`, user);
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.usersUrl}/${id}`);
    }

    // ===== ORDERS =====

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }
    // Crear un servicio
    createService(service: Service): Observable<Service> {
        return this.http.post<Service>(this.servicesUrl, service);
    }

    // Actualizar un servicio
    updateService(service: Service): Observable<Service> {
        const url = `${this.servicesUrl}/${service.id}`;
        return this.http.put<Service>(url, service);
    }

    // Eliminar un servicio
    deleteService(id: string): Observable<void> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.delete<void>(url);
    }
}
