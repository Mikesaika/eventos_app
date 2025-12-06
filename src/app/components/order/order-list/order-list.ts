import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';
import { OrderService } from '../../../services/order.service';
import { ServEventosJson } from '../../../services/ServEventosJson';
import { NotificationComponent } from '../../../shared/notification/notification';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    CurrencyPipe,
    DatePipe,
    NotificationComponent
  ],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})

export class OrderList implements OnInit {
  orders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];
  loading: boolean = true;

  constructor(
    private orderService: OrderService,
    private miServicio: ServEventosJson
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Cargar todos los datos en paralelo
    this.orderService.getOrders().subscribe({
      next: (ordersData) => {
        this.orders = ordersData;
      },
      error: (e) => console.error('Error al cargar pedidos:', e)
    });

    this.miServicio.getUsers().subscribe({
      next: (usersData) => {
        this.users = usersData;
      },
      error: (e) => console.error('Error al cargar usuarios:', e)
    });

    this.miServicio.getServices().subscribe({
      next: (servicesData) => {
        this.services = servicesData;
        this.loading = false;
      },
      error: (e) => {
        console.error('Error al cargar servicios:', e);
        this.loading = false;
      }
    });
  }

  getUserName(id: number): string {
    const user = this.users.find(u => Number(u.id) === Number(id));
    return user ? user.name : 'Usuario no encontrado';
  }

  getUserEmail(id: number): string {
    const user = this.users.find(u => Number(u.id) === Number(id));
    return user ? user.email : 'N/A';
  }

  getServiceName(id: number): string {
    const service = this.services.find(s => Number(s.id) === Number(id));
    return service ? service.name : 'Servicio no encontrado';
  }

  getServiceDescription(id: number): string {
    const service = this.services.find(s => Number(s.id) === Number(id));
    return service ? service.description : 'N/A';
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase();
    if (!term) {
      this.loadData();
    } else {
      this.orders = this.orders.filter(o =>
        this.getUserName(o.userId).toLowerCase().includes(term) ||
        this.getServiceName(o.serviceId).toLowerCase().includes(term) ||
        o.date.includes(term) ||
        o.total.toString().includes(term)
      );
    }
  }

  getActiveOrdersCount(): number {
    return this.orders.filter(o => o.active).length;
  }

  getInactiveOrdersCount(): number {
    return this.orders.filter(o => !o.active).length;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(o => o.active)
      .reduce((sum, o) => sum + o.total, 0);
  }
}