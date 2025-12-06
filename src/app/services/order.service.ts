import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private baseUrl = 'http://localhost:3000';
    private ordersUrl = `${this.baseUrl}/orders`;

    constructor(private http: HttpClient) { }

    // Métodos CRUD para Orders
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }

    getOrderById(id: string): Observable<Order> {
        const url = `${this.ordersUrl}/${id}`;
        return this.http.get<Order>(url);
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.ordersUrl, order);
    }

    updateOrder(order: Order): Observable<Order> {
        const url = `${this.ordersUrl}/${order.id}`;
        return this.http.put<Order>(url, order);
    }

    deleteOrder(id: string): Observable<void> {
        const url = `${this.ordersUrl}/${id}`;
        return this.http.delete<void>(url);
    }

    // Métodos adicionales para funcionalidades específicas
    getOrdersByUserId(userId: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}?userId=${userId}`);
    }

    getOrdersByServiceId(serviceId: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}?serviceId=${serviceId}`);
    }

    getActiveOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}?active=true`);
    }

    getInactiveOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}?active=false`);
    }

    getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.ordersUrl}?date_gte=${startDate}&date_lte=${endDate}`);
    }

    // Método para obtener estadísticas
    getOrdersStatistics(): Observable<any> {
        return this.http.get<any>(`${this.ordersUrl}/statistics`);
    }
}