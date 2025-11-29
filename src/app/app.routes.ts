import { Routes } from '@angular/router';
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';

export const routes: Routes = [
    { path: 'eventos-list', component: EventoList },
    { path: 'eventos-view/:id', component: EventoView },

    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list', pathMatch: 'full' },
];
