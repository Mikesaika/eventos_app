import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { Company } from '../../../models/Company';
import { User } from '../../../models/User';
import { Order } from '../../../models/Order';
import { ServEventosJson } from '../../../services/ServEventosJson';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-eventos-view',
  standalone: true,
  imports: [
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
    ReactiveFormsModule,
    NotificationComponent
  ],
  templateUrl: './eventos-view.html',
  styleUrl: './eventos-view.css',
})
export class EventoView implements OnInit, AfterViewInit {
  servicio!: Service;
  categoria?: Category;
  empresa?: Company;
  users: User[] = [];
  cargando: boolean = true;
  formOrder!: FormGroup;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private eventosService: ServEventosJson,
    private orderService: OrderService,
    private userService: UserService,
    private notify: NotificationService,
    private route: ActivatedRoute,
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
    this.loadServiceData();
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadServiceData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventosService.getServiceById(id).subscribe((serv) => {
      this.servicio = serv;

      this.eventosService.getCategories().subscribe((cats) => {
        this.categoria = cats.find((c) => Number(c.id) === Number(this.servicio.categoryId));
      });

      this.eventosService.getCompanies().subscribe((comps) => {
        this.empresa = comps.find((c) => Number(c.id) === Number(this.servicio.companyId));
      });

      this.cargando = false;
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error cargando usuarios', 'error')
    });
  }

  //  LÓGICA DEL MODAL

  openOrderModal() {
    if (!this.servicio) return;

    this.formOrder.patchValue({
      serviceId: this.servicio.id,
      total: this.servicio.price,
      date: new Date().toISOString().split('T')[0],
      userId: ''
    });

    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Por favor selecciona un usuario y fecha', 'error');
      return;
    }

    const datos = this.formOrder.value;

    datos.serviceId = Number(this.servicio.id);
    datos.total = Number(this.servicio.price);

    this.orderService.createOrder(datos).subscribe({
      next: () => {
        this.notify.show('¡Cotización solicitada con éxito!', 'success');
        this.modalRef.hide();
        this.formOrder.reset({ active: true });
      },
      error: (err) => this.notify.show('Error al solicitar: ' + err.message, 'error')
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}