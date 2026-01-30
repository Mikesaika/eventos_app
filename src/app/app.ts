import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common'; 
import { AuthService } from './services/auth.service';
import { User } from './models/User';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'EventosApp';

  // Variables de estado de autenticación
  isLoggedIn: boolean = false;
  currentUser: User | null = null;

  // Control de menús
  activeMenu: string | null = null;
  isMobileMenuOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // 1. Suscripción al estado de login
    this.authService.isLoggedIn$.subscribe(res => {
      this.isLoggedIn = res;
    });

    // 2. CORRECCIÓN CRÍTICA: Suscripción reactiva al usuario
    // Esto asegura que 'currentUser' no sea nulo en el HTML tras el login
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Función para cerrar sesión
  logout() {
    this.authService.logout();
    this.closeMenu();
  }

  // Función para alternar los dropdowns (Pedidos, Categorías, Perfil)
  toggleDropdown(menuName: string) {
    // Si el menú ya está abierto, lo cierra; si no, abre el nuevo
    this.activeMenu = this.activeMenu === menuName ? null : menuName;
  }

  // Función para el menú hamburguesa
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Cerrar todo al navegar o hacer clic fuera
  closeMenu() {
    this.activeMenu = null;
    this.isMobileMenuOpen = false;
  }
}