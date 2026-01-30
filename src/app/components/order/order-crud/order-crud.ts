import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';

// Servicios
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ServEventosJson } from '../../../services/serv.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';
import { Dialog } from '../../../shared/dialog/dialog';

declare const bootstrap: any;

@Component({
  selector: 'app-order-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    CurrencyPipe,
    DatePipe,
    NotificationComponent
  ],
  templateUrl: './order-crud.html',
  styleUrls: ['./order-crud.css']
})
export class OrderCrud implements OnInit, AfterViewInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];

  formOrder!: FormGroup;
  editingId: string | null = null;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService 
  ) {
    this.formOrder = this.fb.group({
      userId: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      total: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    } else {
      console.error('Bootstrap no está cargado.');
    }
  }

  // CARGA DE DATOS 
  loadData(): void {
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
      },
      error: (err) => {
        this.notify.show('Error al cargar datos iniciales', 'error');
      }
    });
  }

  // BUSQUEDA 
  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
      this.orders = [...this.allOrders];
    } else {
      this.orders = this.allOrders.filter(o =>
        this.getUserName(o.userId).toLowerCase().includes(term) ||
        this.getServiceName(o.serviceId).toLowerCase().includes(term) ||
        o.date.includes(term) ||
        o.total.toString().includes(term)
      );
    }
  }

  getUserName(id: any): string {
    if (!id) return 'Sin Usuario';
    const user = this.users.find(u => String(u.id) === String(id));
    return user ? user.name : 'Usuario no encontrado';
  }

  getServiceName(id: any): string {
    if (!id) return 'Sin Servicio';
    const service = this.services.find(s => String(s.id) === String(id));
    return service ? service.name : 'Servicio no encontrado';
  }

  getServicePrice(id: any): number {
    const service = this.services.find(s => String(s.id) === String(id));
    return service ? service.price : 0;
  }

  // VALIDADORES

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getFieldError(field: string, error: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.hasError(error) : false;
  }

  // MODALES 
  openNew() {
    this.editingId = null;
    this.formOrder.reset({ active: true, total: 0 });
    this.modalRef.show();
  }

  openEdit(order: Order) {
    this.editingId = order.id || null;
    this.formOrder.patchValue(order);
    this.modalRef.show();
  }

  onServiceChange() {
    const serviceId = this.formOrder.get('serviceId')?.value;
    if (serviceId) {
      const price = this.getServicePrice(serviceId);
      this.formOrder.patchValue({ total: price });
    }
  }

  // GUARDAR 
  save() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Por favor completa los campos obligatorios', 'error');
      return;
    }

    const datos = this.formOrder.value;

    datos.total = Number(datos.total);

    if (this.editingId) {
      // EDITAR
      const orderUpdate: Order = { ...datos, id: this.editingId };
      this.orderService.updateOrder(orderUpdate).subscribe({
        next: () => {
          this.notify.show('Pedido actualizado correctamente', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err) => {
          this.notify.show('Error al actualizar: ' + err.message, 'error');
        }
      });
    } else {
      // CREAR
      this.orderService.createOrder(datos).subscribe({
        next: () => {
          this.notify.show('Pedido creado exitosamente', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err) => {
          this.notify.show('Error al crear: ' + err.message, 'error');
        }
      });
    }
  }

  // ELIMINAR 
  delete(order: Order) {
    const modalRef = this.modalService.open(Dialog);

    modalRef.componentInstance.data = {
      title: 'Eliminar Pedido',
      message: `¿Estás seguro de que deseas eliminar el pedido del usuario "${this.getUserName(order.userId)}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && order.id) {
        this.orderService.deleteOrder(order.id).subscribe({
          next: () => {
            this.notify.show('Pedido eliminado correctamente', 'success');
            this.loadData();
          },
          error: (e) => {
            this.notify.show('Error al eliminar pedido', 'error');
          }
        });
      }
    }).catch(() => { });
  }
}