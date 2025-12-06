import { Routes } from '@angular/router';
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';
import { ServicesCrud } from './components/services-crud/services-crud';
import { UsersCrud } from './components/usuarios/users-crud/users-crud';
import { OrderCrud } from './components/order/order-crud/order-crud';
import { OrderList } from './components/order/order-list/order-list';

export const routes: Routes = [
    // Eventos
    { path: 'eventos-list', component: EventoList },
    { path: 'eventos-view/:id', component: EventoView },

    // Servicios
    { path: 'services-crud', component: ServicesCrud },

    // Usuarios
    { path: 'usuarios', component: UsersCrud },

    // Pedidos 
    { path: 'order-crud', component: OrderCrud },
    { path: 'order-list', component: OrderList },

    // Default y Wildcard (Solo una vez al final)
    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list' }
];