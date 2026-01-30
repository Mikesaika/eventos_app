import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
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
      error: (err) => {
        console.error('Error cargando datos iniciales', err);
        this.loading = false;
      }
    });
  }

  getUserName(id: any): string {
    if (!id) return 'Sin Usuario';
    const user = this.users.find(u => String(u.id) === String(id));
    return user ? user.name : 'Usuario no encontrado';
  }

  getUserEmail(id: any): string {
    if (!id) return 'N/A';
    const user = this.users.find(u => String(u.id) === String(id));
    return user ? user.email : 'N/A';
  }

  getServiceName(id: any): string {
    if (!id) return 'Sin Servicio';
    const service = this.services.find(s => String(s.id) === String(id));
    return service ? service.name : 'Servicio no encontrado';
  }

  getServiceDescription(id: any): string {
    if (!id) return 'N/A';
    const service = this.services.find(s => String(s.id) === String(id));
    return service ? service.description : 'N/A';
  }


  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();

    if (!term) {
      this.orders = [...this.allOrders];
      return;
    }

    this.orders = this.allOrders.filter(o =>
      this.getUserName(o.userId).toLowerCase().includes(term) ||
      this.getServiceName(o.serviceId).toLowerCase().includes(term) ||
      o.date.includes(term) ||
      o.total.toString().includes(term)
    );
  }


  getActiveOrdersCount(): number {
    return this.allOrders.filter(o => o.active).length;
  }

  getInactiveOrdersCount(): number {
    return this.allOrders.filter(o => !o.active).length;
  }

  getTotalRevenue(): number {
    return this.allOrders
      .filter(o => o.active)
      .reduce((sum, o) => sum + o.total, 0);
  }
}