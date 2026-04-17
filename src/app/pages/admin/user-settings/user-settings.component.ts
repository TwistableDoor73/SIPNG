import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { AppStateService, User } from '../../../services/app-state.service';
import { Permission, ALL_PERMISSIONS } from '../../../services/permission.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, CheckboxModule],
  template: `
    <div class="page-wrapper animate-in">
      <div class="mb-4">
        <h2 class="view-title">
           <i class="pi pi-shield mr-2"></i> Gestión de Usuarios
        </h2>
        <p class="text-secondary">Administra usuarios y sus permisos</p>
      </div>

      @if (state.hasPermission('user:create')) {
        <p-button label="Nuevo usuario" icon="pi pi-user-plus" styleClass="p-button-success mb-4" (click)="openCreateUserDialog()"></p-button>
      }

      <div class="glass-card p-4 mb-4">
        <table class="w-full">
          <thead>
            <tr class="border-b border-b-gray-700" >
              <th class="text-left p-3">Usuario</th>
              <th class="text-left p-3">Email</th>
              <th class="text-center p-3">Permisos</th>
              <th class="text-center p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
            <tr class="border-b border-b-gray-800 hover:bg-gray-900">
              <td class="p-3">
                 <div class="flex items-center gap-2">
                   <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                     {{user.name.charAt(0).toUpperCase()}}
                   </div>
                   <strong>{{user.name}}</strong>
                 </div>
              </td>
              <td class="p-3 text-secondary">{{user.email}}</td>
              <td class="p-3 text-center"><span class="text-xs bg-purple-700 bg-opacity-30 px-3 py-1 rounded-full">{{user.role}}</span></td>
              <td class="p-3 text-center">
                  <div class="flex justify-center gap-3">
                    @if (state.hasPermission('user:manage_permissions')) {
                       <i class="pi pi-key text-blue-400 cursor-pointer" title="Permisos" (click)="openPermissionsDialog(user)"></i>
                    }
                    @if (state.hasPermission('user:delete')) {
                       <i class="pi pi-trash text-red-500 cursor-pointer" (click)="deleteUser(user.id)"></i>
                    }
                  </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Dialog para crear/editar usuario -->
    <p-dialog [(visible)]="displayUserDialog" [modal]="true" [style]="{ width: '400px' }" header="Nuevo Usuario">
      <div class="space-y-4">
         <div>
            <label class="block text-sm mb-2">Nombre *</label>
            <input pInputText class="w-full" [(ngModel)]="newUser().name" />
         </div>
         <div>
            <label class="block text-sm mb-2">Email *</label>
            <input pInputText type="email" class="w-full" [(ngModel)]="newUser().email" />
         </div>
         <div class="flex justify-end gap-2 mt-4">
            <p-button label="Cancelar" severity="secondary" (click)="displayUserDialog = false"></p-button>
            <p-button label="Crear" (click)="saveUser()"></p-button>
         </div>
      </div>
    </p-dialog>

    <!-- Dialog para permisos -->
    <p-dialog [(visible)]="displayPermissionsDialog" [modal]="true" [style]="{ width: '500px' }" header="Gestión de Permisos">
      <div *ngIf="selectedUserForPermissions()" class="space-y-4">
         <div class="text-center mb-4">
            <strong class="block">{{selectedUserForPermissions()?.name}}</strong>
            <small class="text-secondary">{{selectedUserForPermissions()?.email}}</small>
         </div>
         
         <div>
            <label class="block text-sm mb-2">Rol</label>
            <select class="p-inputtext w-full" [(ngModel)]="permissionEditState" (ngModelChange)="onRoleChange($event)">
              <option value="Usuario">Usuario</option>
              <option value="Dev">Dev</option>
              <option value="Admin">Admin</option>
              <option value="Superadmin">Superadmin</option>
            </select>
         </div>

         <div>
            <label class="block text-sm mb-2">Permisos ({{permissionEditStateArray.length}})</label>
            <div class="space-y-2" style="max-height: 250px; overflow-y: auto;">
               @for (perm of allPermissionsList; track perm) {
               <div class="flex items-center">
                  <p-checkbox [value]="perm" [(ngModel)]="permissionEditStateArray"></p-checkbox>
                  <label class="ml-2 text-sm">{{perm}}</label>
               </div>
               }
            </div>
         </div>
         
         <div class="flex justify-end gap-2 mt-4">
            <p-button label="Cancelar" severity="secondary" (click)="displayPermissionsDialog = false"></p-button>
            <p-button label="Guardar" (click)="savePermissions()"></p-button>
         </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .view-title { font-size: 1.75rem; font-weight: bold; }
    .text-secondary { color: #94a3b8; }
    .w-full { width: 100%; }
    .p-3 { padding: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-end { justify-content: flex-end; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .block { display: block; }
    .cursor-pointer { cursor: pointer; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-center { text-align: center; }
    .rounded-full { border-radius: 9999px; }
    .px-3 { padding: 0 0.75rem; }
    .py-1 { padding: 0.25rem 0; }
    .h-8 { height: 2rem; }
    .w-8 { width: 2rem; }
  `]
})
export class UserSettingsComponent implements OnInit {
  state = inject(AppStateService);
  httpService = inject(HttpService);

  users = signal<any[]>([]);
  displayUserDialog = false;
  displayPermissionsDialog = false;
  newUser = signal<Partial<User>>({ role: 'user', permissions: [], groups: [] });
  selectedUserForPermissions = signal<User | null>(null);
  
  permissionEditState: string = 'user';
  permissionEditStateArray: Permission[] = [];
  allPermissionsList = ALL_PERMISSIONS;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Load all users from backend
    this.httpService.getUsers().subscribe({
      next: (response) => {
        const mappedUsers = response.data.map((u: any) => ({
          id: u.uuid,
          name: u.name,
          email: u.email,
          role: u.role,
          permissions: (u.permissions || []) as any,
          groups: (u.groups || []).map((g: any) => g.id || g),
          avatarUrl: u.avatar_url || '',
          age: u.age,
          phone: u.phone
        }));
        this.users.set(mappedUsers);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  openCreateUserDialog() {
    this.newUser.set({ name: '', email: '', role: 'user', permissions: [], groups: [] });
    this.displayUserDialog = true;
  }

  saveUser() {
    // Users are created through registration, not here for now
    alert('Users are created through the registration process');
    this.displayUserDialog = false;
  }

  openPermissionsDialog(user: User) {
    this.selectedUserForPermissions.set(user);
    this.permissionEditState = user.role;
    this.permissionEditStateArray = [...user.permissions];
    this.displayPermissionsDialog = true;
  }

  onRoleChange(newRole: string) {
    if (newRole === 'superadmin') this.permissionEditStateArray = [...ALL_PERMISSIONS];
    else if (newRole === 'admin') this.permissionEditStateArray = ['ticket:create' as Permission, 'ticket:edit' as Permission, 'ticket:delete' as Permission, 'ticket:view' as Permission, 'ticket:assign' as Permission, 'ticket:change_status' as Permission, 'ticket:comment' as Permission, 'group:view' as Permission, 'user:create' as Permission, 'user:edit' as Permission, 'user:view' as Permission];
    else this.permissionEditStateArray = ['ticket:view' as Permission, 'ticket:comment' as Permission, 'group:view' as Permission];
  }

  savePermissions() {
    // Permissions would be saved to backend here
    this.displayPermissionsDialog = false;
  }

  deleteUser(userId: string) {
    if (confirm('¿Eliminar este usuario?')) {
      // Would delete from backend
      this.loadUsers();
    }
  }
}
