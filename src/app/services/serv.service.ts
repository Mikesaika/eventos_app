import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { Category } from '../models/Category';
import { Company } from '../models/Company';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root',
})
export class ServEventosJson {
    
    private baseUrl = 'http://localhost:5000/api'; 

    private servicesUrl = `${this.baseUrl}/servicios`; 
    private categoriesUrl = `${this.baseUrl}/categorias`;
    private companiesUrl = `${this.baseUrl}/empresas`;
    private ordersUrl = `${this.baseUrl}/ordenes`;

    constructor(private http: HttpClient) { }

    // --- SERVICIOS ---
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }


    getServiceById(id: number): Observable<Service> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.get<Service>(url);
    }

    createService(service: Service): Observable<Service> {
        return this.http.post<Service>(this.servicesUrl, service);
    }

    updateService(service: Service): Observable<Service> {
        
        const url = `${this.servicesUrl}/${service.servicioID}`;
        return this.http.put<Service>(url, service);
    }

    deleteService(id: number): Observable<void> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.delete<void>(url);
    }

    // --- CATEGORÍAS ---
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    getCategoryById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.categoriesUrl}/${id}`);
    }

    // --- EMPRESAS ---
    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }

    getCompanyById(id: number): Observable<Company> {
        return this.http.get<Company>(`${this.companiesUrl}/${id}`);
    }

    // --- ÓRDENES ---
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }

    getOrdersByUserId(usuarioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}/usuario/${usuarioID}`);
    }
}