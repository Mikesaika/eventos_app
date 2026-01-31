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
    
    // 1. ELIMINAR EL PREFIJO /api: JSON Server no lo usa por defecto
    private baseUrl = 'http://localhost:5000'; 

    // 2. SINCRONIZAR MAYÚSCULAS: Deben coincidir con las llaves de tu db.json
    private servicesUrl = `${this.baseUrl}/Servicios`; 
    private categoriesUrl = `${this.baseUrl}/Categorias`;
    private companiesUrl = `${this.baseUrl}/Empresas`;
    private ordersUrl = `${this.baseUrl}/Ordenes`;

    constructor(private http: HttpClient) { }

    // --- SERVICIOS ---
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }

    getServiceById(id: number): Observable<Service> {
        // Para que esto funcione, cada servicio en db.json debe tener un campo "id"
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

    // --- ÓRDENES ---
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }

    getOrdersByUserId(usuarioID: number): Observable<Order[]> {
        // Cambio de lógica para JSON Server: se filtra por query parameter
        return this.http.get<Order[]>(`${this.ordersUrl}?usuarioID=${usuarioID}`);
    }
}