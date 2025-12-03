import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  form = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
    active: new FormControl(true)
  });

  notificationMessage = '';
  notificationType: 'success'|'error'|'warning'|'info' = 'success';

  constructor(
    private catSrv: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.catSrv.get(+id).subscribe({
        next: c => this.form.patchValue(c),
        error: () => { this.notificationMessage='No se pudo cargar la categoría'; this.notificationType='error'; }
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.notificationMessage = 'Corrija los errores del formulario';
      this.notificationType = 'warning';
      return;
    }

    const value = this.form.value;
    if (value.id) {
      this.catSrv.update(value.id, value).subscribe({
        next: () => { this.notificationMessage='Categoría actualizada'; this.notificationType='success'; this.router.navigate(['/categories']); },
        error: () => { this.notificationMessage='Error al actualizar'; this.notificationType='error'; }
      });
    } else {
      this.catSrv.create(value).subscribe({
        next: () => { this.notificationMessage='Categoría creada'; this.notificationType='success'; this.router.navigate(['/categories']); },
        error: () => { this.notificationMessage='Error al crear'; this.notificationType='error'; }
      });
    }
  }
}
