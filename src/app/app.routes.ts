import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Importación de Componentes
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';
import { ServicesCrud } from './components/services-crud/services-crud';
import { UsersCrud } from './components/usuarios/users-crud/users-crud';
import { OrderCrud } from './components/order/order-crud/order-crud';
import { OrderList } from './components/order/order-list/order-list';
import { CategoryListComponent } from './components/category/category-list/category-list';
import { CategoryFormComponent } from './components/category/category-form/category-form';
import { LoginComponent } from './components/auth/login/login';

// Importación del Guard (Asegúrate de que la ruta sea correcta)
import { authGuard } from './guards/auth.guard'; 

export const routes: Routes = [
    // 1. LOGIN: Ruta prioritaria
    { 
        path: 'login', 
        component: LoginComponent, 
        title: 'Iniciar Sesión' 
    },

    // 2. RUTAS PÚBLICAS
    { 
        path: 'eventos-list', 
        component: EventoList,
        title: 'Catálogo de Servicios' 
    },
    { 
        path: 'eventos-view/:id', 
        component: EventoView,
        title: 'Detalle del Servicio'
    },

    // 3. RUTAS PROTEGIDAS (ADMIN)
    {
        path: 'admin',
        canActivate: [authGuard], // El guardián protege a todos los hijos
        children: [
            { 
                path: 'services', 
                component: ServicesCrud,
                title: 'Gestión de Servicios'
            },
            { 
                path: 'usuarios', 
                component: UsersCrud,
                title: 'Administración de Usuarios'
            },
            { 
                path: 'orders', 
                component: OrderList,
                title: 'Listado de Pedidos'
            },
            { 
                path: 'order-manage', 
                component: OrderCrud, 
                title: 'Gestión de Pedidos'
            },
            { 
                path: 'categories', 
                component: CategoryListComponent,
                title: 'Categorías de Eventos'
            },
            { 
                path: 'categories/new', 
                component: CategoryFormComponent,
                title: 'Nueva Categoría'
            },
            { 
                path: 'categories/edit/:id', 
                component: CategoryFormComponent,
                title: 'Editar Categoría'
            },
            // Redirección por defecto dentro de admin
            { path: '', redirectTo: 'services', pathMatch: 'full' }
        ]
    },

    // 4. MANEJO DE REDIRECCIONES GLOBALES
    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list' }
];