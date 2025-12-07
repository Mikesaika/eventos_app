import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Agregamos RouterLink para el botón volver
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../shared/notification/notification';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../services/notification.service';
import { Category } from '../../../models/Category';

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
    private notify: NotificationService
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
}