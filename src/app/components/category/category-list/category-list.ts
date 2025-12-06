import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { Router } from '@angular/router';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { TableComponent } from '../../shared/table/table.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [NotificationComponent, TableComponent],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private service: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.list().subscribe({
      next: (data) => this.categories = data,
      error: () => {
        this.notificationMessage = 'Error cargando categorías.';
        this.notificationType = 'error';
      }
    });
  }

  newCategory() {
    this.router.navigate(['/categories/new']);
  }

  editCategory(id: string) {
    this.router.navigate(['/categories/edit', id]);
  }

  deleteCategory(id: string) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.notificationMessage = 'Categoría eliminada localmente.';
    this.notificationType = 'success';
  }
}
