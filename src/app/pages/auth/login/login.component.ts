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
    <div class="login-wrapper animate-in flex-column-center">
      <h1 class="brand-logo mb-4 text-center" style="font-size: 3rem; margin-top: -2rem;">SIPNG</h1>
      <p-card styleClass="glass-card login-card transition-all" [style]="{ width: '100%', 'max-width': '400px' }">
        <ng-template pTemplate="title">
          <div class="header-content">
            <i class="pi title-icon {{ isLoginMode ? 'pi-bolt' : 'pi-user-plus' }}"></i>
            <h2>{{ isLoginMode ? 'Iniciar Sesión' : 'Registro' }}</h2>
          </div>
        </ng-template>
        <ng-template pTemplate="subtitle">
          <p>{{ isLoginMode ? 'Ingresa tus credenciales para acceder.' : 'Crea una cuenta para comenzar.' }}</p>
        </ng-template>

        <div class="form-container">
          <!-- REGISTRATION FIELDS ONLY -->
          <ng-container *ngIf="!isLoginMode">
             <div class="field mt-4">
               <label for="name">Nombre Completo</label>
               <input pInputText id="name" [(ngModel)]="registerData.name" autocomplete="off" class="w-full custom-input-filled" />
             </div>
             <div class="grid formgrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
               <div class="field mt-4">
                 <label for="age">Edad</label>
                 <!-- Validation: Min 0, Step 1, block -, e, . -->
                 <input type="number" pInputText id="age" [(ngModel)]="registerData.age" autocomplete="off" class="w-full custom-input-filled" min="0" step="1" (keydown)="preventInvalidAgeInput($event)" />
               </div>
               <div class="field mt-4">
                 <label for="phone">Teléfono (10 dgt)</label>
                 <input type="text" pInputText id="phone" [(ngModel)]="registerData.phone" autocomplete="off" class="w-full custom-input-filled" maxlength="10" (keypress)="allowOnlyNumbers($event)" />
               </div>
             </div>
          </ng-container>

          <div class="field mt-4">
            <label for="email">Correo Electrónico</label>
            <!-- In login mode, modifies global state directly for easier flow. In register mode, modifies local form -->
            <input *ngIf="isLoginMode" pInputText id="email" [ngModel]="state.email()" (ngModelChange)="state.email.set($event)" autocomplete="off" class="w-full custom-input-filled" />
            <input *ngIf="!isLoginMode" pInputText id="reg-email" [(ngModel)]="registerData.email" autocomplete="off" class="w-full custom-input-filled" />
          </div>

          <div class="field mt-4">
            <label for="password">Contraseña</label>
            <p-password *ngIf="isLoginMode" id="password" [ngModel]="state.password()" (ngModelChange)="state.password.set($event)" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full custom-input-filled"></p-password>
            <p-password *ngIf="!isLoginMode" id="reg-password" [(ngModel)]="registerData.password" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full custom-input-filled"></p-password>
          </div>

          <p-button [label]="isLoginMode ? 'Ingresar' : 'Registrarse'" [icon]="isLoginMode ? 'pi pi-sign-in' : 'pi pi-check'" styleClass="w-full mt-5 login-btn" (onClick)="handleSubmit()"></p-button>
          
          <div class="text-center mt-4">
             <a class="text-secondary text-sm cursor-pointer hover:text-primary transition-colors" (click)="toggleMode()">
               {{ isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión' }}
             </a>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class LoginComponent {
  state = inject(AppStateService);
  router = inject(Router);

  isLoginMode = true;
  
  registerData = {
    name: '',
    email: '',
    password: '',
    age: undefined as number | undefined,
    phone: ''
  };

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  preventInvalidAgeInput(event: KeyboardEvent) {
    // Prevent decimal point, negative sign, and letter 'e'
    if (['.', ',', 'e', 'E', '-', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    // Allow only numeric digits (0-9)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  handleSubmit() {
    if (this.isLoginMode) {
      this.state.login();
      if (this.state.isAuthenticated()) {
        this.router.navigate(['/home']);
      }
    } else {
      // Validations and Registration
      if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
        alert('Por favor, llena los campos obligatorios (Nombre, Email, Contraseña).');
        return;
      }
      if (this.registerData.phone && this.registerData.phone.length !== 10) {
        alert('El registro requiere un número de teléfono de exactamente 10 dígitos.');
        return;
      }

      const success = this.state.register(this.registerData, this.registerData.password);
      if (success) {
        alert('Cuenta creada exitosamente.');
        this.router.navigate(['/home']);
      } else {
        alert('Ese correo electrónico ya está en uso. Por favor, utiliza otro.');
      }
    }
  }
}
