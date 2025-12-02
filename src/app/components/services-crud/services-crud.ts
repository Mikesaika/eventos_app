import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/Service';
import { Category } from '../../models/Category';
import { Company } from '../../models/Company';
import { ServEventosJson } from '../../services/ServEventosJson';
import { Dialog } from '../../shared/dialog/dialog';

// Se declara la variable de Bootstrap globalmente para el modal nativo
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
    CurrencyPipe
  ],
  templateUrl: './services-crud.html',
  styleUrls: ['./services-crud.css']
})
export class ServicesCrud implements OnInit {

  // Listas de datos
  services: Service[] = [];
  allServices: Service[] = []; // Copia de seguridad para el buscador
  categories: Category[] = [];
  companies: Company[] = [];

  // Variables del formulario y modal
  formService!: FormGroup;
  editingId: string | null = null;
  modalRef: any; // Referencia al modal de Bootstrap

  @ViewChild('serviceModalRef') modalElement!: ElementRef;

  constructor(
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    // Inicialización del formulario con validaciones
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
    // se inicializa el modal nativo de Bootstrap
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    } else {
      console.error('Bootstrap no está cargado. Revisa tu angular.json');
    }
  }

  // ===== CARGA DE DATOS =====
  loadServices(): void {
    this.miServicio.getServices().subscribe((data) => {
      this.services = data;
      this.allServices = data; // Guardamos la copia para buscar
    });
  }

  loadCategories(): void {
    this.miServicio.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  loadCompanies(): void {
    this.miServicio.getCompanies().subscribe((data) => {
      this.companies = data;
    });
  }

  //BUSQUEDA 
  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase();

    if (!term) {
      this.services = this.allServices; // Si está vacío se mostrara todo
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
    event.target.src = 'https://via.placeholder.com/50';
  }
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

  save() {
    // Verifica
    if (this.formService.invalid) {
      this.formService.markAllAsTouched(); // Marca los campos en rojo
      alert('Por favor completa todos los campos obligatorios');
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
          alert("Servicio actualizado correctamente");
          this.modalRef.hide();
          this.loadServices();
        },
        error: (err) => alert("Error al actualizar: " + err.message)
      });
    } else {
      // CREAR
      this.miServicio.createService(datos).subscribe({
        next: () => {
          alert("Servicio creado exitosamente");
          this.modalRef.hide();
          this.loadServices();
        },
        error: (err) => alert("Error al crear: " + err.message)
      });
    }
  }

  delete(service: Service) {
    const modalRef = this.modalService.open(Dialog);

    modalRef.componentInstance.data = {
      title: 'Eliminar Servicio',
      message: `¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && service.id) {
        this.miServicio.deleteService(service.id).subscribe(() => {
          this.loadServices(); // Recargara la tabla
        });
      }
    }).catch(() => {
      // Si el usuario cierra o cancela
    });
  }
}