import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  isFieldInvalid(field: string): boolean {
    const formField = this.loginForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/documentos']);
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Usuário ou senha inválidos. Por favor, tente novamente.';
        } else {
          this.errorMessage = 'Erro ao conectar ao serviço de autenticação. Verifique se o servidor está online.';
        }
        console.error('❌ [LoginComponent] Erro no login:', err);
      }
    });
  }
}
