import { Component, signal } from '@angular/core';
// 1. Agregamos RouterLink y RouterLinkActive a la importación
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  // 2. Los agregamos al array de imports para poder usarlos en el HTML
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('eventos_app');
}