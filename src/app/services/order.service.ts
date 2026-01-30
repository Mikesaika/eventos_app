import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private baseUrl = 'http://localhost:5000/api'; 
    private ordersUrl = `${this.baseUrl}/ordenes`;

    constructor(private http: HttpClient) { }

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }

    
    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.ordersUrl}/${id}`);
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.ordersUrl, order);
    }

    updateOrder(order: Order): Observable<Order> {
        
        return this.http.put<Order>(`${this.ordersUrl}/${order.ordenID}`, order);
    }

    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${this.ordersUrl}/${id}`);
    }

    
    getOrdersByUserId(usuarioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}/usuario/${usuarioID}`);
    }

    getOrdersByServiceId(servicioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}/servicio/${servicioID}`);
    }

    // Filtrado por estados en lugar de booleano active
    getOrdersByStatus(estado: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}/estado/${estado}`);
    }

    getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
        
        return this.http.get<Order[]>(`${this.ordersUrl}/rango?inicio=${startDate}&fin=${endDate}`);
    }

    getOrdersStatistics(): Observable<any> {
        return this.http.get<any>(`${this.ordersUrl}/estadisticas`);
    }
}