import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { Router } from '@angular/router';

// Importa componentes reutilizables (ajusta nombres reales)
import { TableReutilizable } from '../shared/table-reutilizable/table-reutilizable';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [TableReutilizable, NotificationComponent], // ajusta según tu proyecto
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  notificationMessage = '';
  notificationType: 'success'|'error'|'warning'|'info' = 'success';

  constructor(
    private catSrv: CategoryService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.catSrv.list().subscribe({
      next: data => this.categories = data,
      error: err => { this.notificationMessage = 'Error cargando categorías'; this.notificationType='error'; }
    });
  }

  edit(cat: Category) {
    this.router.navigate(['/categories/edit', cat.id]);
  }

  add() {
    this.router.navigate(['/categories/new']);
  }

  remove(cat: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Confirmar', message: `Eliminar ${cat.name}?` }});
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.catSrv.delete(cat.id!).subscribe({
          next: () => { this.notificationMessage = 'Categoría eliminada'; this.notificationType='success'; this.load(); },
          error: () => { this.notificationMessage = 'Error eliminando'; this.notificationType='error'; }
        });
      }
    });
  }
}
