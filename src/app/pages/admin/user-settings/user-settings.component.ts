import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { AppStateService, User } from '../../../services/app-state.service';
import { Permission, ALL_PERMISSIONS } from '../../../services/permission.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, CheckboxModule],
  template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 pt-2 px-2">
        <h2 class="view-title m-0">
           <i class="pi pi-shield text-secondary mr-2"></i> Gestión de Usuarios <br>
           <span class="text-secondary font-normal block mt-2" style="font-size: 0.9rem">Administra usuarios y sus permisos individuales</span>
        </h2>
        <p-button *ngIf="state.currentUser().role === 'Superadmin'" label="Nuevo usuario" icon="pi pi-user-plus" styleClass="p-button-success" (onClick)="openCreateUserDialog()"></p-button>
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
              <td class="text-center"><span class="badge-rounded-purple">{{user.permissions.length}} permisos</span></td>
              <td>
                 <div class="text-xs text-secondary" style="max-width: 150px; line-height: 1.4">
                   <ng-container *ngFor="let g of user.groups; let last = last">
                      {{ getGroupName(g) }}{{ !last ? ', ' : '' }}
                   </ng-container>
                 </div>
              </td>
              <td class="text-center">
                 <div class="flex-row-center justify-content-center gap-3">
                   <i *ngIf="state.currentUser().role === 'Superadmin' || state.currentUser().id === user.id" class="pi pi-pencil text-green-500 cursor-pointer" title="Editar" (click)="openEditUserDialog(user)"></i>
                   <i *ngIf="state.currentUser().role === 'Superadmin'" class="pi pi-key text-yellow-500 cursor-pointer" title="Permisos" (click)="openPermissionsDialog(user)"></i>
                   <i *ngIf="state.currentUser().role === 'Superadmin'" class="pi pi-trash text-red-500 cursor-pointer" (click)="removeSystemUser(user.id)" title="Eliminar"></i>
                 </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    
    <p-dialog [visible]="displayUserDialog()" (visibleChange)="displayUserDialog.set($event)" [modal]="true" [style]="{ width: '40vw', minWidth: '400px' }" [header]="isEditingUser() ? 'Editar Usuario' : 'Crear Usuario'" styleClass="ticket-dialog" [closable]="true" (onHide)="closeUserDialog()">
      <div class="form-container">
         <div class="grid formgrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Nombre completo *</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="newUser().name" />
            </div>
            <div class="field">
               <label class="block mb-2 text-sm text-secondary">Email *</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="newUser().email" />
            </div>
            <div class="field" *ngIf="!isEditingUser()">
               <label class="block mb-2 text-sm text-secondary">Contraseña *</label>
               <span class="p-input-icon-right w-full">
                  <input type="password" pInputText class="w-full custom-input-filled" />
                  <i class="pi pi-eye"></i>
               </span>
            </div>
         </div>
         <div class="flex-row-center justify-content-end gap-3 mt-5">
            <button class="p-button-text text-green-500 border-none bg-transparent cursor-pointer font-bold" (click)="closeUserDialog()">Cancelar</button>
            <p-button [label]="isEditingUser() ? 'Guardar' : 'Crear'" icon="pi pi-check" styleClass="p-button-success" (onClick)="saveUser()"></p-button>
         </div>
      </div>
    </p-dialog>

    <p-dialog [visible]="displayPermissionsDialog()" (visibleChange)="displayPermissionsDialog.set($event)" [modal]="true" [style]="{ width: '400px' }" header="Gestión de Permisos" styleClass="ticket-dialog" [closable]="true" (onHide)="closePermissionsDialog()">
      <div class="form-container" *ngIf="selectedUserForPermissions()">
         <div class="mb-4 text-center">
            <strong style="color: #818cf8; font-size: 1.1rem">{{selectedUserForPermissions()?.name}}</strong><br>
            <small class="text-secondary">{{selectedUserForPermissions()?.email}}</small>
         </div>
         <div class="field mb-3">
            <label class="block mb-2 text-sm text-secondary">Rol del Sistema</label>
            <select class="p-inputtext p-component w-full" [(ngModel)]="permissionEditState" (ngModelChange)="onRoleChange($event)">
              <option value="Usuario">Usuario</option>
              <option value="Dev">Dev</option>
              <option value="Admin">Admin</option>
              <option value="Superadmin">Superadmin</option>
            </select>
         </div>
         <div class="field mb-4">
            <label class="block mb-2 text-sm text-secondary">Permisos seleccionados ({{permissionEditStateArray.length}})</label>
            <div class="flex flex-column gap-2" style="max-height: 200px; overflow-y: auto; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
               <div *ngFor="let perm of allPermissionsList" class="field-checkbox mb-2" style="display: flex; align-items: center;">
                  <p-checkbox [value]="perm" [(ngModel)]="permissionEditStateArray" [inputId]="perm"></p-checkbox>
                  <label [for]="perm" class="ml-2 text-sm text-secondary cursor-pointer" style="margin-top: 2px;">{{perm}}</label>
               </div>
            </div>
         </div>
         
         <div class="flex-row-center justify-content-end gap-3 mt-5">
            <button class="p-button-text text-green-500 border-none bg-transparent cursor-pointer font-bold" (click)="closePermissionsDialog()">Cancelar</button>
            <p-button label="Guardar Permisos" icon="pi pi-check" styleClass="p-button-success" (onClick)="savePermissions()"></p-button>
         </div>
      </div>
    </p-dialog>
  `
})
export class UserSettingsComponent {
  state = inject(AppStateService);

  displayUserDialog = signal(false);
  isEditingUser = signal(false);
  displayPermissionsDialog = signal(false);
  
  newUserSearch = signal('');
  newUser = signal<Partial<User>>({});
  
  selectedUserForPermissions = signal<User | null>(null);
  permissionEditState: string = 'Usuario';
  permissionEditStateArray: Permission[] = [];
  allPermissionsList = ALL_PERMISSIONS;

  getGroupName(id: string) {
    const grp = this.state.groups.find(g => g.id === id);
    return grp ? grp.name : 'Grupo';
  }

  openCreateUserDialog() {
    this.isEditingUser.set(false);
    this.newUser.set({ name: '', email: '', role: 'Usuario', permissions: [], groups: [] });
    this.displayUserDialog.set(true);
  }

  openEditUserDialog(user: User) {
    this.isEditingUser.set(true);
    // Clonamos para evitar editar la referencia directa
    this.newUser.set({ ...user });
    this.displayUserDialog.set(true);
  }

  saveUser() {
    const data = this.newUser();
    if (data.name && data.email) {
      if (this.isEditingUser() && data.id) {
        // Actualizar
        this.state.systemUsers.update(users => 
          users.map(u => u.id === data.id ? { ...u, name: data.name!, email: data.email! } : u)
        );
      } else {
        // Crear
        const newU: User = {
          id: 'U-' + Math.floor(Math.random() * 10000),
          name: data.name,
          email: data.email,
          role: data.role || 'Usuario',
          permissions: data.permissions || [],
          avatarUrl: 'https://i.pravatar.cc/150?u=' + data.email,
          groups: data.groups || []
        };
        this.state.systemUsers.update(users => [...users, newU]);
      }
      this.displayUserDialog.set(false);
    }
  }

  closeUserDialog() {
    this.displayUserDialog.set(false);
    this.isEditingUser.set(false);
  }

  openPermissionsDialog(user: User) {
    this.selectedUserForPermissions.set(user);
    this.permissionEditState = user.role;
    this.permissionEditStateArray = [...user.permissions];
    this.displayPermissionsDialog.set(true);
  }

  onRoleChange(newRole: string) {
    if (newRole === 'Superadmin') this.permissionEditStateArray = [...ALL_PERMISSIONS];
    else if (newRole === 'Admin') this.permissionEditStateArray = ['ticket:create', 'ticket:edit', 'ticket:delete', 'ticket:view', 'ticket:assign', 'ticket:change_status', 'ticket:comment', 'group:view', 'user:create', 'user:edit', 'user:view'];
    else if (newRole === 'Dev') this.permissionEditStateArray = ['ticket:create', 'ticket:edit', 'ticket:view', 'ticket:change_status', 'ticket:comment', 'group:view'];
    else if (newRole === 'Usuario') this.permissionEditStateArray = ['ticket:view', 'ticket:comment', 'group:view'];
  }

  savePermissions() {
    const userToEdit = this.selectedUserForPermissions();
    if (userToEdit) {
      if (userToEdit.id === this.state.currentUser().id && this.permissionEditState !== 'Superadmin') {
        alert("Atención: Estás cambiando tu propio rol. Perderás los privilegios de Superadmin al recargar.");
      }
      this.state.systemUsers.update(users => 
        users.map(u => u.id === userToEdit.id ? { ...u, role: this.permissionEditState, permissions: [...this.permissionEditStateArray] } : u)
      );
      this.displayPermissionsDialog.set(false);
    }
  }

  closePermissionsDialog() {
    this.displayPermissionsDialog.set(false);
    this.selectedUserForPermissions.set(null);
  }

  removeSystemUser(userId: string) {
    if (userId === this.state.currentUser().id) {
      alert('No puedes eliminar tu propio usuario Superadmin.');
      return;
    }
    this.state.systemUsers.update(users => users.filter(u => u.id !== userId));
  }
}
