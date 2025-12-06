import { Routes } from '@angular/router';
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';
import { ServicesCrud } from './components/services-crud/services-crud';
import { UsersCrud } from './components/usuarios/users-crud/users-crud';
import { OrderCrud } from './components/order/order-crud/order-crud';
import { OrderList } from './components/order/order-list/order-list';

export const routes: Routes = [
    { path: 'eventos-list', component: EventoList },
    { path: 'eventos-view/:id', component: EventoView },
  
    { path: 'services-crud', component: ServicesCrud },

    { path: 'usuarios', component: UsersCrud },

    //Rutas de ORDER
    { path: 'order-crud', component: OrderCrud },
    { path: 'order-list', component: OrderList },
  
    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list', pathMatch: 'full' },
];
