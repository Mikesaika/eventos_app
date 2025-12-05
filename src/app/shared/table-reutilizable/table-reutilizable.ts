import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-table-reutilizable',
  standalone: true,
  imports: [NgFor],
  templateUrl: './table-reutilizable.html',
  styleUrl: './table-reutilizable.css',
})
export class TableReutilizable {

  @Input() data: any[] = [];  // Datos de las películas
  @Input() columns: string[] = [];  // Columnas para mostrar
  @Input() headers: string[] = [];
  currentPage: number = 1;
  pageSize: number = 5;

  get displayedHeaders(): string[] {
    return this.headers.length === this.columns.length ? this.headers : this.columns;
  }
  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.data.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  sortData(column: string) {
    this.data = [...this.data].sort((a, b) =>
      String(a[column] ?? '').localeCompare(String(b[column] ?? ''))
    );
  }
}

