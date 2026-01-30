import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, CurrencyPipe, UpperCasePipe, NgIf, NgFor } from '@angular/common'; // Aseguramos directivas comunes
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { User } from '../../../models/User';
import { Order } from '../../../models/Order';
import { ServEventosJson } from '../../../services/serv.service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    NgClass,
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
    ReactiveFormsModule,
    NotificationComponent
  ],
  templateUrl: './eventos-list.html',
  styleUrl: './eventos-list.css',
})
export class EventoList implements OnInit, AfterViewInit {
  services: Service[] = [];
  categories: Category[] = [];
  users: User[] = [];
  cargando: boolean = true;

  formOrder!: FormGroup;
  selectedService: Service | null = null;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private eventosService: ServEventosJson,
    private orderService: OrderService,
    private userService: UserService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    // Formulario reactivo alineado a la tabla 'Ordenes'
    this.formOrder = this.fb.group({
      usuarioID: ['', Validators.required],
      fechaEvento: ['', Validators.required], 
      servicioID: [''],
      precioTotal: [0],
      estado: ['Pendiente'], 
      observaciones: [''],
      activo: [true]
    });
  }

  ngOnInit() {
    this.cargarDatos();
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined' && this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  cargarDatos() {
    this.eventosService.getServices().subscribe({
      next: (servs) => {
        this.services = servs;
        // Cargamos categorías después de los servicios para asegurar el mapeo
        this.eventosService.getCategories().subscribe(cats => this.categories = cats);
        this.cargando = false;
      },
      error: () => {
        this.notify.show('Error al conectar con el servidor de datos', 'error');
        this.cargando = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error al cargar lista de clientes', 'error')
    });
  }

  // --- LÓGICA DEL MODAL DE COTIZACIÓN ---

  openOrderModal(service: Service) {
    this.selectedService = service;
    this.formOrder.patchValue({
      servicioID: service.servicioID,
      precioTotal: service.precio,
      fechaEvento: '', // Limpio para obligar selección
      usuarioID: '',
      estado: 'Pendiente',
      activo: true
    });
    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Por favor, completa los campos requeridos', 'warning');
      return;
    }

    if (!this.selectedService) return;

    const datos = this.formOrder.value;
    
    // Objeto final para SQL Server
    const orderToSave: Order = {
      ...datos,
      usuarioID: Number(datos.usuarioID),
      servicioID: Number(this.selectedService.servicioID),
      precioTotal: Number(this.selectedService.precio),
      fechaOrden: new Date(),
      estado: 'Pendiente',
      activo: true
    };

    this.orderService.createOrder(orderToSave).subscribe({
      next: () => {
        this.notify.show('¡Solicitud enviada correctamente!', 'success');
        this.modalRef.hide();
        this.formOrder.reset({ estado: 'Pendiente', activo: true });
        this.selectedService = null;
      },
      error: (err) => this.notify.show('No se pudo procesar la solicitud', 'error')
    });
  }

  // --- HELPERS DE INTERFAZ ---

  getCategoryName(categoriaID: number): string {
    const cat = this.categories.find((c) => Number(c.categoriaID) === Number(categoriaID));
    return cat ? cat.nombre : 'General';
  }

  getBadgeClass(classification: string): string {
    if (!classification) return 'badge-plata';
    const normalized = classification.toLowerCase();
    return `badge-${normalized}`;
  }

  trackById(index: number, item: Service): number | undefined {
    return item.servicioID;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}