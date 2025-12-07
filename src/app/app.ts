import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'EventosApp';

  // Variable para controlar QUÉ menú desplegable está abierto
  activeMenu: string | null = null;

  // Variable para controlar si el menú de hamburguesa (móvil) está abierto
  isMobileMenuOpen: boolean = false;

  // Función para alternar los dropdowns
  toggleDropdown(menuName: string) {
    if (this.activeMenu === menuName) {
      this.activeMenu = null;
    } else {
      this.activeMenu = menuName;
    }
  }

  // Función para el menú móvil
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Cerrar todo al navegar
  closeMenu() {
    this.activeMenu = null;
    this.isMobileMenuOpen = false;
  }
}