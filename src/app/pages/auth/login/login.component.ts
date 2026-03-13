import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { AppStateService } from '../../../services/app-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PasswordModule, CardModule],
  template: `
    <div class="login-wrapper animate-in">
      <p-card styleClass="glass-card login-card">
        <ng-template pTemplate="title">
          <div class="header-content">
            <i class="pi pi-bolt title-icon"></i>
            <h2>Iniciar Sesión</h2>
          </div>
        </ng-template>
        <ng-template pTemplate="subtitle">
          <p>Ingresa tus credenciales para acceder a tus espacios.</p>
        </ng-template>

        <div class="form-container">
          <div class="field mt-4">
            <label for="email">Usuario o Email</label>
            <input pInputText id="email" [ngModel]="state.email()" (ngModelChange)="state.email.set($event)" autocomplete="off"
              class="w-full" />
          </div>

          <div class="field mt-4">
            <label for="password">Contraseña</label>
            <p-password id="password" [ngModel]="state.password()" (ngModelChange)="state.password.set($event)" [feedback]="false"
              [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
          </div>

          <p-button label="Ingresar" icon="pi pi-sign-in" styleClass="w-full mt-5 login-btn"
            (onClick)="onLogin()"></p-button>
        </div>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  state = inject(AppStateService);
  router = inject(Router);

  onLogin() {
    this.state.login();
    if (this.state.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }
}
