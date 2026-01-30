import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category } from '../../../models/Category';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../services/notification.service';
import { Dialog } from '../../../shared/dialog/dialog';
import { NotificationComponent } from '../../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NotificationComponent
  ],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryListComponent implements OnInit, AfterViewInit {
  categories: Category[] = [];
  allCategories: Category[] = [];
  formCategory!: FormGroup;
  editingId: number | null = null; // Cambiado a number para coincidir con SQL
  modalRef: any;

  @ViewChild('categoryModalRef') modalElement!: ElementRef;

  constructor(
    private service: CategoryService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService,
    private route: ActivatedRoute 
  ) {
    // Sincronizado con nombres en español
    this.formCategory = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', Validators.required],
      icono: ['bi-tag'],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        setTimeout(() => { this.openNew(); }, 100);
      }
    });
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadData(): void {
    this.service.list().subscribe({
      next: (data) => {
        this.categories = data;
        this.allCategories = [...data];
      },
      error: () => this.notify.show('Error al cargar categorías', 'error')
    });
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
      this.categories = [...this.allCategories];
    } else {
      this.categories = this.allCategories.filter(c =>
        c.nombre.toLowerCase().includes(term) ||
        (c.descripcion || '').toLowerCase().includes(term)
      );
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formCategory.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string, error: string): boolean {
    const control = this.formCategory.get(field);
    return !!control && control.hasError(error);
  }

  openNew() {
    this.editingId = null;
    this.formCategory.reset({ activo: true, icono: 'bi-tag' });
    this.modalRef.show();
  }

  openEdit(cat: Category) {
    this.editingId = cat.categoriaID || null;
    // Mapeamos los datos al formulario
    this.formCategory.patchValue({
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      icono: cat.icono,
      activo: cat.activo
    });
    this.modalRef.show();
  }

  save() {
    if (this.formCategory.invalid) {
      this.formCategory.markAllAsTouched();
      this.notify.show('Completa los campos obligatorios', 'error');
      return;
    }

    const datos = this.formCategory.value;

    if (this.editingId) {
      // Sincronizado con categoriaID
      const catUpdate: Category = { ...datos, categoriaID: this.editingId };
      this.service.update(catUpdate).subscribe({ // Ajustado a 1 argumento si tu servicio lo pide así
        next: () => {
          this.notify.show('Categoría actualizada', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al actualizar', 'error')
      });
    } else {
      this.service.create(datos).subscribe({
        next: () => {
          this.notify.show('Categoría creada', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al crear', 'error')
      });
    }
  }

  delete(cat: Category) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Categoría',
      message: `¿Eliminar la categoría "${cat.nombre}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && cat.categoriaID) {
        this.service.delete(cat.categoriaID).subscribe({
          next: () => {
            this.notify.show('Categoría eliminada', 'success');
            this.loadData();
          },
          error: () => this.notify.show('Error al eliminar', 'error')
        });
      }
    }).catch(() => { });
  }
}