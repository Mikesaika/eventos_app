import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { Category } from '../../../models/Category';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';
import { Dialog } from '../../../shared/dialog/dialog'; 

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent, RouterLink],
  templateUrl: './category-form.html'
})
export class CategoryFormComponent implements OnInit {

  mode: 'new' | 'edit' = 'new';
  currentId: number | null = null;
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CategoryService,
    private fb: FormBuilder,
    private notify: NotificationService,
    private modalService: NgbModal 
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.required],
      icon: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.mode = 'edit';
      this.currentId = Number(id); 

      this.service.get(this.currentId).subscribe({
        next: (cat) => {
          if (cat) {
            this.form.patchValue(cat);
          }
        },
        error: () => this.notify.show('Error al cargar la categoría', 'error')
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.show('Completa los campos requeridos', 'error');
      return;
    }

    const datos: Category = this.form.value as Category;

    if (this.mode === 'new') {
      // CREAR
      this.service.create(datos).subscribe({
        next: () => {
          this.notify.show('Categoría creada correctamente', 'success');
          setTimeout(() => this.router.navigate(['/categories']), 1000);
        },
        error: () => this.notify.show('Error al crear', 'error')
      });

    } else {
      // EDITAR
      if (this.currentId) {
        const catUpdate = { ...datos, id: this.currentId };
        
        this.service.update(this.currentId, catUpdate).subscribe({
          next: () => {
            this.notify.show('Categoría actualizada', 'success');
            setTimeout(() => this.router.navigate(['/categories']), 1000);
          },
          error: () => this.notify.show('Error al actualizar', 'error')
        });
      }
    }
  }

  // LÓGICA DE ELIMINAR 
  delete() {
    if (!this.currentId) return;

   //el diálogo de confirmación
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría? No se puede deshacer.'
    };

    // la respuesta
    modalRef.result.then((result) => {
      if (result === true) {
        this.service.delete(this.currentId!).subscribe({
          next: () => {
            this.notify.show('Categoría eliminada', 'success');
            this.router.navigate(['/categories']);
          },
          error: (err) => {
            console.error('Error backend:', err);
            this.notify.show('Error al eliminar. Revisa la consola.', 'error');
          }
        });
      }
    }).catch(() => {});
  }
}