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
    private baseUrl = 'http://localhost:3000';

    private servicesUrl = `${this.baseUrl}/services`;
    private categoriesUrl = `${this.baseUrl}/categories`;
    private companiesUrl = `${this.baseUrl}/companies`;
    private ordersUrl = `${this.baseUrl}/orders`;


    constructor(private http: HttpClient) { }

    //SERVICES 
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }

    getServiceById(id: string): Observable<Service> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.get<Service>(url);
    }

    createService(service: Service): Observable<Service> {
        return this.http.post<Service>(this.servicesUrl, service);
    }

    updateService(service: Service): Observable<Service> {
        const url = `${this.servicesUrl}/${service.id}`;
        return this.http.put<Service>(url, service);
    }

    deleteService(id: string): Observable<void> {
        const url = `${this.servicesUrl}/${id}`;
        return this.http.delete<void>(url);
    }
    //Estos son los servicios de los demas componentes de mis compañeros una vez hagan 
    // su parte ellos tendran su propio servicio
    // CATEGORIES 
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    // COMPANIES 
    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }

    //  ORDERS 
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }
}