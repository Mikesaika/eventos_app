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

    // ===== SERVICES =====
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }

    getServiceById(id: string): Observable<Service> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.get<Service>(url);
    }

    // ===== CATEGORIES =====
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    // ===== COMPANIES =====
    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }

    // ===== USERS =====
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.usersUrl);
    }

    // ===== ORDERS =====
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }
}
