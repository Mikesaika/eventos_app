import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgClass } from '@angular/common'; 
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  cargando = false;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotificationService
  ) {
    // Definimos 'password' para que coincida con el parámetro que espera tu AuthService
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] 
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/eventos-list';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Enviamos el objeto con { email, password }
    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        this.notify.show(`¡Bienvenido de nuevo, ${user.nombre}!`, 'success');
        
        // Redirección basada en el rol definido en tu db.json
        if (user.rol === 'Administrador') {
          this.router.navigate(['/admin/services']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.notify.show(err.message || 'Credenciales incorrectas', 'error');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}