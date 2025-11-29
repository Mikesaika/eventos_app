import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, CurrencyPipe, UpperCasePipe } from '@angular/common';

import { ServEventosJson } from '../../../services/ServEventosJson';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { Company } from '../../../models/Company';


@Component({
  selector: 'app-eventos-view',
  standalone: true,
  imports: [
    NgIf,
    CurrencyPipe,
    UpperCasePipe, // para usar | uppercase
    RouterLink,
  ],
  templateUrl: './eventos-view.html',
  styleUrl: './eventos-view.css',
})
export class EventoView {
  servicio!: Service;
  categoria?: Category;
  empresa?: Company;
  cargando: boolean = true;

  constructor(
    private eventosService: ServEventosJson,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    // 1) Obtener el servicio por id
    this.eventosService.getServiceById(id).subscribe((serv) => {
      this.servicio = serv;

      // 2) Con el servicio, cargamos categorías y empresas para mostrar nombres
      this.eventosService.getCategories().subscribe((cats) => {
        this.categoria = cats.find(
          (c) => Number(c.id) === this.servicio.categoryId
        );
      });

      this.eventosService.getCompanies().subscribe((comps) => {
        this.empresa = comps.find(
          (c) => Number(c.id) === this.servicio.companyId
        );
      });

      this.cargando = false;
    });
  }
}
