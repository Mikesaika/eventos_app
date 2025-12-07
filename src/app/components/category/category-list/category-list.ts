import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { Router } from '@angular/router';

import { TableReutilizable } from '../../../shared/table-reutilizable/table-reutilizable';
import { NotificationComponent } from '../../../shared/notification/notification';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    TableReutilizable,
    NotificationComponent
  ],
  templateUrl: './category-list.html'
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];
  constructor(
    private service: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.list().subscribe((data: Category[]) => {
      return this.categories = data;
    });
  }
}
