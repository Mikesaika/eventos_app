import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/Service';
import { Category } from '../../models/Category';
import { Company } from '../../models/Company';
import { ServEventosJson } from '../../services/ServEventosJson';
import { Dialog } from '../../shared/dialog/dialog';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from '../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-services-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    TitleCasePipe,
    CurrencyPipe,
    NotificationComponent
  ],
  templateUrl: './services-crud.html',
  styleUrls: ['./services-crud.css']
})
export class ServicesCrud implements OnInit, AfterViewInit {
  services: Service[] = [];
  allServices: Service[] = [];
  categories: Category[] = [];
  companies: Company[] = [];
  // Formulario y Modal
  formService!: FormGroup;
  editingId: string | null = null;
  modalRef: any;
  @ViewChild('serviceModalRef') modalElement!: ElementRef;

  constructor(
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService
  ) {
    this.formService = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      companyId: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required],
      classification: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadCategories();
    this.loadCompanies();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    } else {
      console.error('Bootstrap no está cargado.');
    }
  }

  // CARGA DE DATOS 
  loadServices(): void {
    this.miServicio.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.allServices = data;
      },
      error: (e) => this.notify.show('Error al cargar servicios', 'error')
    });
  }

  loadCategories(): void {
    this.miServicio.getCategories().subscribe(data => this.categories = data);
  }

  loadCompanies(): void {
    this.miServicio.getCompanies().subscribe(data => this.companies = data);
  }

  // BUSQUEDA 
  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase();
    if (!term) {
      this.services = this.allServices;
    } else {
      this.services = this.allServices.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
      );
    }
  }
  getCategoryName(id: number): string {
    const cat = this.categories.find(c => Number(c.id) === Number(id));
    return cat ? cat.name : 'Sin Categoría';
  }

  getCompanyName(id: number): string {
    const comp = this.companies.find(c => Number(c.id) === Number(id));
    return comp ? comp.name : 'Sin Empresa';
  }

  handleImageError(event: any) {
    // Fallback si la imagen falla
    event.target.src = 'https://via.placeholder.com/50';
  }

  //HELPER VALIDATORS 
  // Devuelve true si el campo es inválido Y el usuario lo ha tocado o modificado
  isFieldInvalid(field: string): boolean {
    const control = this.formService.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // Devuelve true si el campo tiene un error específico
  getFieldError(field: string, error: string): boolean {
    const control = this.formService.get(field);
    return control ? control.hasError(error) : false;
  }

  // MODALES
  openNew() {
    this.editingId = null;
    this.formService.reset({ active: true, price: 0 });
    this.modalRef.show();
  }

  openEdit(service: Service) {
    this.editingId = service.id || null;
    this.formService.patchValue(service);
    this.modalRef.show();
  }

  // GUARDAR
  save() {
    if (this.formService.invalid) {
      // Esto dispara la validación visual en todos los campos
      this.formService.markAllAsTouched();
      this.notify.show('Por favor completa los campos obligatorios', 'error');
      return;
    }

    const datos = this.formService.value;
    datos.categoryId = Number(datos.categoryId);
    datos.companyId = Number(datos.companyId);

    if (this.editingId) {
      // EDITAR
      const serviceUpdate: Service = { ...datos, id: this.editingId };
      this.miServicio.updateService(serviceUpdate).subscribe({
        next: () => {
          this.notify.show('Servicio actualizado correctamente', 'success');
          this.modalRef.hide();
          this.loadServices();
        },
        error: (err) => this.notify.show("Error al actualizar: " + err.message, 'error')
      });
    } else {
      // CREAR
      this.miServicio.createService(datos).subscribe({
        next: () => {
          this.notify.show('Servicio creado exitosamente', 'success');
          this.modalRef.hide();
          this.loadServices();
        },
        error: (err) => this.notify.show("Error al crear: " + err.message, 'error')
      });
    }
  }

  // ELIMINAR
  delete(service: Service) {
    const modalRef = this.modalService.open(Dialog);

    modalRef.componentInstance.data = {
      title: 'Eliminar Servicio',
      message: `¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && service.id) {
        this.miServicio.deleteService(service.id).subscribe({
          next: () => {
            this.notify.show('Servicio eliminado correctamente', 'success');
            this.loadServices();
          },
          error: (e) => this.notify.show('Error al eliminar servicio', 'error')
        });
      }
    }).catch(() => { });
  }
}