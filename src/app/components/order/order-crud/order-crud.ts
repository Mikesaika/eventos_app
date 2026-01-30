import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, TitleCasePipe, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

// Modelos e Interfaces
import { Order } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';

// Servicios de Datos
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ServEventosJson } from '../../../services/serv.service';
import { NotificationService } from '../../../services/notification.service';

// Componentes Compartidos
import { NotificationComponent } from '../../../shared/notification/notification';
import { Dialog } from '../../../shared/dialog/dialog';

declare const bootstrap: any;

@Component({
  selector: 'app-order-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe, 
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
  editingId: number | null = null; 
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
      usuarioID: ['', [Validators.required]],
      servicioID: ['', [Validators.required]],
      fechaEvento: ['', [Validators.required]],
      precioTotal: [0, [Validators.required, Validators.min(0)]],
      estado: ['Pendiente', [Validators.required]],
      observaciones: [''],
      activo: [true] 
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined' && this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

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
      error: () => this.notify.show('Error al sincronizar con SQL Server', 'error')
    });
  }

  // --- MÉTODOS DE BÚSQUEDA Y MAPEO ---

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
      this.orders = [...this.allOrders];
    } else {
      this.orders = this.allOrders.filter(o =>
        this.getUserName(o.usuarioID).toLowerCase().includes(term) ||
        this.getServiceName(o.servicioID).toLowerCase().includes(term) ||
        (o.estado && o.estado.toLowerCase().includes(term))
      );
    }
  }

  getUserName(id: any): string {
    const user = this.users.find(u => Number(u.usuarioID) === Number(id));
    return user ? user.nombre : 'Usuario no encontrado';
  }

  getServiceName(id: any): string {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.nombre : 'Servicio no encontrado';
  }

  getServicePrice(id: any): number {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.precio : 0;
  }

  // --- LÓGICA DE FORMULARIO ---

  onServiceChange() {
    const servicioID = this.formOrder.get('servicioID')?.value;
    if (servicioID) {
      const price = this.getServicePrice(servicioID);
      this.formOrder.patchValue({ precioTotal: price });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string, error: string): boolean {
    const control = this.formOrder.get(field);
    return !!control && control.hasError(error);
  }

  // --- ACCIONES CRUD ---

  openNew() {
    this.editingId = null;
    this.formOrder.reset({ estado: 'Pendiente', precioTotal: 0, activo: true });
    this.modalRef.show();
  }

  openEdit(order: Order) {
    this.editingId = order.ordenID || null;
    this.formOrder.patchValue(order);
    this.modalRef.show();
  }

  save() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Por favor completa los campos obligatorios', 'error');
      return;
    }

    const datos = this.formOrder.value;
    const payload: Order = {
      ...datos,
      usuarioID: Number(datos.usuarioID),
      servicioID: Number(datos.servicioID),
      precioTotal: Number(datos.precioTotal),
      ordenID: this.editingId || undefined
    };

    if (this.editingId) {
      this.orderService.updateOrder(payload).subscribe({
        next: () => {
          this.notify.show('Pedido actualizado en DB', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err) => this.notify.show('Error en SQL: ' + err.message, 'error')
      });
    } else {
      this.orderService.createOrder(payload).subscribe({
        next: () => {
          this.notify.show('Pedido registrado en SQL Server', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err) => this.notify.show('Error al registrar pedido', 'error')
      });
    }
  }

  delete(order: Order) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Registro',
      message: `¿Borrar pedido de "${this.getUserName(order.usuarioID)}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && order.ordenID) {
        this.orderService.deleteOrder(order.ordenID).subscribe({
          next: () => {
            this.notify.show('Registro eliminado de la base de datos', 'success');
            this.loadData();
          },
          error: () => this.notify.show('Error al eliminar en el servidor', 'error')
        });
      }
    }).catch(() => { });
  }
}