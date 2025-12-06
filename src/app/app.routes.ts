import { Routes } from '@angular/router';
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';
import { ServicesCrud } from './components/services-crud/services-crud';
import { CategoryListComponent} from './components/category/category-list/category-list';
import { CategoryFormComponent } from './components/category/category-form/category-form';

export const routes: Routes = [
    { path: 'eventos-list', component: EventoList },
    { path: 'eventos-view/:id', component: EventoView },
    { path: 'services-crud', component: ServicesCrud },
    { path: 'categories', component: CategoryListComponent },
    { path: 'categories/new', component: CategoryFormComponent },
    { path: 'categories/edit/:id', component: CategoryFormComponent},

    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list', pathMatch: 'full' },
];
