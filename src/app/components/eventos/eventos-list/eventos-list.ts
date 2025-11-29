import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgIf,
  NgForOf,
  NgClass,
  CurrencyPipe,
  UpperCasePipe,
} from '@angular/common';

import { ServEventosJson } from '../../../services/ServEventosJson';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, CurrencyPipe, UpperCasePipe, RouterLink],
  templateUrl: './eventos-list.html',
  styleUrl: './eventos-list.css',
})
export class EventoList {
  services: Service[] = [];
  categories: Category[] = [];
  cargando: boolean = true;

  constructor(private eventosService: ServEventosJson) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.eventosService.getCategories().subscribe((cats) => {
      this.categories = cats;
    });

    this.eventosService.getServices().subscribe((servs) => {
      this.services = servs;
      this.cargando = false;
    });
  }

  getCategoryName(categoryId: number): string {
    const cat = this.categories.find((c) => Number(c.id) === categoryId);
    return cat ? cat.name : 'Sin categoría';
  }

  getBadgeClass(classification: string): string {
    switch (classification) {
      case 'plata':
        return 'badge-plata';
      case 'oro':
        return 'badge-oro';
      case 'diamante':
        return 'badge-diamante';
      default:
        return '';
    }
  }

  trackById(index: number, item: Service): string | undefined {
    return item.id;
  }
}
