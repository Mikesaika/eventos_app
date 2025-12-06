import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent implements OnInit {

  mode: 'new' | 'edit' = 'new';

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', Validators.required),
    icon: new FormControl('', Validators.required),
    active: new FormControl(true)
  });

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CategoryService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.params['id'];

    if (id) {
      this.mode = 'edit';

      this.service.get(id).subscribe(cat => {
        if (cat) this.form.patchValue(cat);
      });
    }
  }

  save() {
    const cat: Category = this.form.value as Category;

    if (this.mode === 'new') {
      cat.id = crypto.randomUUID().slice(0, 4);
      this.notificationMessage = 'Categoría creada localmente.';
    } else {
      this.notificationMessage = 'Categoría actualizada localmente.';
    }

    this.notificationType = 'success';
    this.router.navigate(['/categories']);
  }
}
