import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, CurrencyPipe, UpperCasePipe } from '@angular/common';
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
    this.formOrder = this.fb.group({
      userId: ['', Validators.required],
      date: ['', Validators.required],
      serviceId: [''],
      total: [0],
      active: [true]
    });
  }

  ngOnInit() {
    this.cargarDatos();
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  cargarDatos() {
    this.eventosService.getCategories().subscribe(cats => this.categories = cats);
    this.eventosService.getServices().subscribe(servs => {
      this.services = servs;
      this.cargando = false;
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error al cargar usuarios', 'error')
    });
  }

  openOrderModal(service: Service) {
    this.selectedService = service;
    this.formOrder.patchValue({
      serviceId: service.id,
      total: service.price,
      date: new Date().toISOString().split('T')[0],
      userId: ''
    });
    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Selecciona usuario y fecha', 'error');
      return;
    }

    if (!this.selectedService) return;

    const datos = this.formOrder.value;
    datos.serviceId = Number(this.selectedService.id);
    datos.total = Number(this.selectedService.price);

    this.orderService.createOrder(datos).subscribe({
      next: () => {
        this.notify.show('¡Cotización solicitada con éxito!', 'success');
        this.modalRef.hide();
        this.selectedService = null;
        this.formOrder.reset({ active: true });
      },
      error: (err) => this.notify.show('Error: ' + err.message, 'error')
    });
  }

  // Helpers
  getCategoryName(categoryId: number): string {
    const cat = this.categories.find((c) => Number(c.id) === Number(categoryId));
    return cat ? cat.name : 'Sin categoría';
  }

  getBadgeClass(classification: string): string {
    switch (classification) {
      case 'plata': return 'badge-plata';
      case 'oro': return 'badge-oro';
      case 'diamante': return 'badge-diamante';
      default: return '';
    }
  }

  trackById(index: number, item: Service): string | undefined {
    return item.id;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}