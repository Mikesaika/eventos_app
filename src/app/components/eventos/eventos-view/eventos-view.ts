import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, UpperCasePipe, NgIf, TitleCasePipe } from '@angular/common'; // Agregamos NgIf y TitleCasePipe
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { Company } from '../../../models/Company';
import { User } from '../../../models/User';
import { Order } from '../../../models/Order';
import { ServEventosJson } from '../../../services/serv.service';
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
    this.loadServiceData();
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined' && this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadServiceData() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;
    const id = Number(idParam);

    this.eventosService.getServiceById(id).subscribe({
      next: (serv) => {
        this.servicio = serv;

  
        this.eventosService.getCategories().subscribe((cats) => {
          this.categoria = cats.find((c) => Number(c.categoriaID) === Number(this.servicio.categoriaID));
        });
        this.eventosService.getCompanies().subscribe((comps) => {
          this.empresa = comps.find((c) => Number(c.empresaID) === Number(this.servicio.empresaID));
        });

        this.cargando = false;
      },
      error: () => {
        this.notify.show('No se pudo encontrar el servicio solicitado', 'error');
        this.cargando = false;
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error cargando la lista de usuarios', 'error')
    });
  }

  openOrderModal() {
    if (!this.servicio) return;

    this.formOrder.patchValue({
      servicioID: this.servicio.servicioID,
      precioTotal: this.servicio.precio,
      fechaEvento: '', 
      usuarioID: '',
      estado: 'Pendiente',
      activo: true
    });

    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Por favor completa los campos requeridos', 'warning');
      return;
    }

    const datos = this.formOrder.value;

    const orderToSave: Order = {
      ...datos,
      usuarioID: Number(datos.usuarioID),
      servicioID: Number(this.servicio.servicioID),
      precioTotal: Number(this.servicio.precio),
      fechaOrden: new Date(), 
      estado: 'Pendiente',
      activo: true
    };

    this.orderService.createOrder(orderToSave).subscribe({
      next: () => {
        this.notify.show('¡Solicitud enviada correctamente!', 'success');
        this.modalRef.hide();
        this.formOrder.reset({ estado: 'Pendiente', activo: true });
      },
      error: (err) => this.notify.show('Error al procesar la solicitud', 'error')
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}