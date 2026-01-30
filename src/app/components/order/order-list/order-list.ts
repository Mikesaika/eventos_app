import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Order } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ServEventosJson } from '../../../services/serv.service';
import { NotificationComponent } from '../../../shared/notification/notification';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, CurrencyPipe, DatePipe, UpperCasePipe],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];
  loading: boolean = true;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private miServicio: ServEventosJson
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      orders: this.orderService.getOrders(),
      users: this.userService.getUsers(),
      services: this.miServicio.getServices()
    }).subscribe({
      next: (response) => {
        this.users = response.users;
        this.services = response.services;
        this.orders = response.orders;
        this.allOrders = [...response.orders];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Mapeo de IDs a nombres 
  getUserName(id: number): string {
    const user = this.users.find(u => Number(u.usuarioID) === Number(id));
    return user ? user.nombre : 'Usuario desconocido';
  }

  getServiceName(id: number): string {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.nombre : 'Servicio no encontrado';
  }

  // Métodos de conteo para las tarjetas superiores
  getPendingOrdersCount(): number {
    return this.allOrders.filter(o => o.estado === 'Pendiente').length;
  }

  getApprovedOrdersCount(): number {
    
    return this.allOrders.filter(o => o.estado === 'Aprobado' || o.estado === 'Confirmado').length;
  }

  getTotalRevenue(): number {
    return this.allOrders
      .filter(o => o.estado !== 'Cancelado')
      .reduce((sum, o) => sum + Number(o.precioTotal), 0);
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Aprobado':
      case 'Confirmado': return 'bg-success text-white';
      case 'Cancelado': return 'bg-danger text-white';
      case 'Finalizado': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
    }
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
      this.orders = [...this.allOrders];
      return;
    }
    this.orders = this.allOrders.filter(o => 
      this.getUserName(o.usuarioID).toLowerCase().includes(term) ||
      this.getServiceName(o.servicioID).toLowerCase().includes(term) ||
      o.estado.toLowerCase().includes(term)
    );
  }
}