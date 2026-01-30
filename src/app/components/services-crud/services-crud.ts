import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/Service';
import { Category } from '../../models/Category';
import { Company } from '../../models/Company';
import { ServEventosJson } from '../../services/serv.service';
import { NotificationService } from '../../services/notification.service';
import { Dialog } from '../../shared/dialog/dialog';
import { NotificationComponent } from '../../shared/notification/notification';

// Declaración para usar los modales de Bootstrap
declare const bootstrap: any;

@Component({
  selector: 'app-services-crud',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    TitleCasePipe,
    CurrencyPipe,
    NotificationComponent
  ],
  templateUrl: './services-crud.html',
  styleUrls: ['./services-crud.css']
})
export class ServicesCrud implements OnInit, AfterViewInit {
  // Listas de datos
  services: Service[] = [];
  allServices: Service[] = [];
  categories: Category[] = [];
  companies: Company[] = [];

  // Control de Formulario y Modal
  formService!: FormGroup;
  editingId: number | null = null; 
  modalRef: any;
  @ViewChild('serviceModalRef') modalElement!: ElementRef;

  constructor(
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService
  ) {
    // Inicialización del formulario con nombres en español (SQL Server compatible)
    this.formService = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
      categoriaID: ['', Validators.required],
      empresaID: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      imagenURL: ['', Validators.required],
      clasificacion: ['', Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadCategories();
    this.loadCompanies();
  }

  ngAfterViewInit() {
    // Inicialización segura del modal de Bootstrap
    if (typeof bootstrap !== 'undefined' && this.modalElement) {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  // --- CARGA DE DATOS ---
  loadServices(): void {
    this.miServicio.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.allServices = [...data];
      },
      error: () => this.notify.show('Error al cargar servicios', 'error')
    });
  }

  loadCategories(): void {
    this.miServicio.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => this.notify.show('Error al cargar categorías', 'error')
    });
  }

  loadCompanies(): void {
    this.miServicio.getCompanies().subscribe({
      next: (data) => this.companies = data,
      error: () => this.notify.show('Error al cargar empresas', 'error')
    });
  }

  // --- MÉTODOS DE BÚSQUEDA Y AYUDA ---
  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    this.services = !term 
      ? [...this.allServices] 
      : this.allServices.filter(s => 
          s.nombre.toLowerCase().includes(term) || 
          s.descripcion.toLowerCase().includes(term)
        );
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => Number(c.categoriaID) === Number(id));
    return cat ? cat.nombre : 'Sin Categoría';
  }

  getCompanyName(id: number): string {
    const comp = this.companies.find(c => Number(c.empresaID) === Number(id));
    return comp ? comp.nombre : 'Sin Empresa';
  }

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/150';
  }

  // --- VALIDACIONES REQUERIDAS POR EL HTML ---
  isFieldInvalid(field: string): boolean {
    const control = this.formService.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string, error: string): boolean {
    const control = this.formService.get(field);
    return control ? control.hasError(error) : false;
  }

  // --- GESTIÓN CRUD ---
  openNew() {
    this.editingId = null;
    this.formService.reset({ activo: true, precio: 0, clasificacion: '' });
    if (this.modalRef) this.modalRef.show();
  }

  openEdit(service: Service) {
    this.editingId = service.servicioID || null;
    this.formService.patchValue(service);
    if (this.modalRef) this.modalRef.show();
  }

  save() {
    if (this.formService.invalid) {
      this.formService.markAllAsTouched();
      this.notify.show('Por favor completa los campos obligatorios', 'error');
      return;
    }

    const datos = { ...this.formService.value };
    // Aseguramos tipos numéricos para el backend
    datos.categoriaID = Number(datos.categoriaID);
    datos.empresaID = Number(datos.empresaID);

    if (this.editingId) {
      const serviceUpdate: Service = { ...datos, servicioID: this.editingId };
      this.miServicio.updateService(serviceUpdate).subscribe({
        next: () => {
          this.notify.show('Servicio actualizado correctamente', 'success');
          this.modalRef.hide();
          this.loadServices();
        },
        error: (err) => this.notify.show("Error al actualizar: " + err.message, 'error')
      });
    } else {
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

  delete(service: Service) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Servicio',
      message: `¿Estás seguro de que deseas eliminar "${service.nombre}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && service.servicioID) {
        this.miServicio.deleteService(service.servicioID).subscribe({
          next: () => {
            this.notify.show('Servicio eliminado correctamente', 'success');
            this.loadServices();
          },
          error: () => this.notify.show('Error al eliminar servicio', 'error')
        });
      }
    }).catch(() => { });
  }
}