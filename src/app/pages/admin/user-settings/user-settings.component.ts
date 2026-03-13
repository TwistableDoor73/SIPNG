import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { AppStateService, User } from '../../../services/app-state.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule],
  template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 pt-2 px-2">
        <h2 class="view-title m-0">
           <i class="pi pi-shield text-secondary mr-2"></i> Gestión de Usuarios <br>
           <span class="text-secondary font-normal block mt-2" style="font-size: 0.9rem">Administra usuarios y sus permisos individuales</span>
        </h2>
        <p-button label="Nuevo usuario" icon="pi pi-user-plus" styleClass="p-button-success" (onClick)="openCreateUserDialog()"></p-button>
      </div>

      <div class="mb-4 px-2">
         <span class="p-input-icon-left w-full max-w-20rem">
            <i class="pi pi-search"></i>
            <input type="text" pInputText placeholder="Buscar usuario..." class="w-full custom-input-filled" />
         </span>
      </div>

      <div class="table-container glass-card pb-2" style="border-radius: 12px; overflow: hidden;">
        <table class="ticket-table custom-theme-table list-table">
          <thead>
            <tr>
              <th class="pl-4">Usuario</th>
              <th>Email</th>
              <th class="text-center">Permisos</th>
              <th>Grupos</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (user of state.systemUsers(); track user.id) {
            <tr class="table-row-hover">
              <td class="pl-4">
                 <div class="flex-row-center gap-3">
                   <div class="user-avatar-small" [style.backgroundImage]="'url(' + user.avatarUrl + ')'" [style.backgroundColor]="user.email.includes('super') ? '#6366f1' : '#a855f7'" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
                      <span *ngIf="!user.avatarUrl" class="text-sm font-bold">{{user.name.charAt(0)}}</span>
                   </div>
                   <div>
                      <strong style="color: #818cf8">{{user.name}}</strong><br>
                      <small class="text-secondary">{{user.email.split('@')[0]}}</small>
                   </div>
                 </div>
              </td>
              <td class="text-secondary text-sm">{{user.email}}</td>
              <td class="text-center"><span class="badge-rounded-purple">{{user.permissions}} / 18</span></td>
              <td>
                 <div class="text-xs text-secondary" style="max-width: 150px; line-height: 1.4">
                   <ng-container *ngFor="let g of user.groups; let last = last">
                      {{ getGroupName(g) }}{{ !last ? ', ' : '' }}
                   </ng-container>
                 </div>
              </td>
              <td class="text-center">
                 <div class="flex-row-center justify-content-center gap-3">
                   <i class="pi pi-pencil text-green-500 cursor-pointer" title="Editar"></i>
                   <i class="pi pi-key text-yellow-500 cursor-pointer" title="Permisos"></i>
                   <i class="pi pi-trash text-red-500 cursor-pointer" (click)="removeSystemUser(user.id)" title="Eliminar"></i>
                 </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    
    <p-dialog [visible]="displayUserDialog()" (visibleChange)="displayUserDialog.set($event)" [modal]="true" [style]="{ width: '40vw', minWidth: '400px' }" header="Crear Usuario" styleClass="ticket-dialog" [closable]="true" (onHide)="closeUserDialog()">
      <div class="form-container">
         <div class="grid formgrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Nombre completo *</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="newUser().name" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Usuario *</label>
               <input pInputText class="w-full custom-input-filled" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Email *</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="newUser().email" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Contraseña *</label>
               <span class="p-input-icon-right w-full">
                  <input type="password" pInputText class="w-full custom-input-filled" />
                  <i class="pi pi-eye"></i>
               </span>
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Teléfono</label>
               <input pInputText class="w-full custom-input-filled" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Dirección</label>
               <input pInputText class="w-full custom-input-filled" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Fecha de nacimiento</label>
               <input pInputText class="w-full custom-input-filled" type="date" value="2026-12-03" />
            </div>
         </div>
         
         <div class="flex-row-center justify-content-end gap-3 mt-5">
            <button class="p-button-text text-green-500 border-none bg-transparent cursor-pointer font-bold" (click)="closeUserDialog()">Cancelar</button>
            <p-button label="Crear" icon="pi pi-check" styleClass="p-button-success" (onClick)="saveNewUser()"></p-button>
         </div>
      </div>
    </p-dialog>
  `
})
export class UserSettingsComponent {
  state = inject(AppStateService);

  displayUserDialog = signal(false);
  newUserSearch = signal('');
  newUser = signal<Partial<User>>({});

  getGroupName(id: string) {
    const grp = this.state.groups.find(g => g.id === id);
    return grp ? grp.name : 'Grupo';
  }

  openCreateUserDialog() {
    this.newUser.set({ name: '', email: '', role: 'Usuario', permissions: 1, groups: [] });
    this.displayUserDialog.set(true);
  }

  saveNewUser() {
    const data = this.newUser();
    if (data.name && data.email) {
      const newU: User = {
        id: 'U-' + Math.floor(Math.random() * 10000),
        name: data.name,
        email: data.email,
        role: data.role || 'Usuario',
        permissions: data.permissions || 1,
        avatarUrl: 'https://i.pravatar.cc/150?u=' + data.email,
        groups: data.groups || []
      };
      this.state.systemUsers.update(users => [...users, newU]);
      this.displayUserDialog.set(false);
    }
  }

  closeUserDialog() {
    this.displayUserDialog.set(false);
  }

  removeSystemUser(userId: string) {
    if (userId === this.state.currentUser().id) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }
    this.state.systemUsers.update(users => users.filter(u => u.id !== userId));
  }
}
