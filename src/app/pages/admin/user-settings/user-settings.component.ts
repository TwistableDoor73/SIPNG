import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { AppStateService, User } from '../../../services/app-state.service';
import { Permission, ALL_PERMISSIONS } from '../../../services/permission.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, CheckboxModule, SelectModule],
  template: `
    <div class="page-wrapper animate-in">
      <div class="mb-4">
        <h2 class="view-title">
           <i class="pi pi-shield mr-2"></i> Gestión de Usuarios
        </h2>
        <p class="text-secondary">Administra usuarios y sus permisos</p>
      </div>

      @if (state.hasPermission('user:create')) {
        <p-button label="Nuevo usuario" icon="pi pi-user-plus" styleClass="p-button-success mb-4" (onClick)="openCreateUserDialog()"></p-button>
      }

      <div class="glass-card p-4 mb-4">
        <table class="w-full">
          <thead>
            <tr class="border-b border-b-gray-700" >
              <th class="text-left p-3">Usuario</th>
              <th class="text-left p-3">Email</th>
              <th class="text-center p-3">Rol</th>
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
                @if (user.role === 'superadmin') {
                  <span class="text-xs text-secondary">Todos (superadmin)</span>
                } @else {
                  <span class="text-xs text-secondary">{{user.permissions?.length || 0}} globales</span>
                }
              </td>
              <td class="p-3 text-center">
                  <div class="flex justify-center gap-3">
                    @if (state.currentUser().role === 'superadmin') {
                       <i class="pi pi-key text-blue-400 cursor-pointer" title="Permisos" (click)="openPermissionsDialog(user)"></i>
                    }
                    @if (state.hasPermission('user:delete') && user.id !== state.currentUser().id) {
                       <i class="pi pi-trash text-red-500 cursor-pointer" (click)="deleteUser(user.id)" title="Eliminar usuario"></i>
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
            <p-button label="Cancelar" severity="secondary" (onClick)="displayUserDialog = false"></p-button>
            <p-button label="Crear" (onClick)="saveUser()"></p-button>
         </div>
      </div>
    </p-dialog>

    <!-- Dialog para permisos -->
    <p-dialog [(visible)]="displayPermissionsDialog" [modal]="true" [closable]="false" [closeOnEscape]="false" [style]="{ width: '550px' }" header="Gestión de Permisos">
      @if (selectedUserForPermissions()) {
      <div class="space-y-4">
         <div class="text-center mb-4">
            <strong class="block">{{selectedUserForPermissions()?.name}}</strong>
            <small class="text-secondary">{{selectedUserForPermissions()?.email}}</small>
         </div>
         
         <!-- Scope selector: Global or per-group -->
         <div>
            <label class="block text-sm mb-2">Alcance de permisos</label>
            <p-select [options]="permissionScopes()" [(ngModel)]="selectedPermissionScope" optionLabel="label" optionValue="value" placeholder="Seleccionar alcance" styleClass="w-full" (onChange)="onScopeChange()"></p-select>
         </div>

         <div>
            <label class="block text-sm mb-2">Rol</label>
            <select class="p-inputtext w-full" [(ngModel)]="permissionEditState" (ngModelChange)="onRoleChange($event)">
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
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
            <button type="button" class="btn-cancel" (click)="displayPermissionsDialog = false">Cancelar</button>
            <button type="button" class="btn-save" [disabled]="saving" (click)="savePermissions()">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
         </div>
      </div>
      }
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
    .btn-cancel {
      padding: 0.5rem 1rem;
      border: 1px solid #475569;
      border-radius: 6px;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
    }
    .btn-cancel:hover { background: #1e293b; }
    .btn-save {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 6px;
      background: #6366f1;
      color: white;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-save:hover { background: #4f46e5; }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
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
  availableGroups = signal<any[]>([]);
  displayUserDialog = false;
  displayPermissionsDialog = false;
  saving = false;
  newUser = signal<Partial<User>>({ role: 'user', permissions: [], groups: [] });
  selectedUserForPermissions = signal<any>(null);
  
  permissionEditState: string = 'user';
  permissionEditStateArray: Permission[] = [];
  selectedPermissionScope: string = 'global';
  allPermissionsList = ALL_PERMISSIONS;

  permissionScopes = signal<{ label: string; value: string }[]>([
    { label: 'Global (todos los grupos)', value: 'global' }
  ]);

  ngOnInit() {
    this.loadUsers();
    this.loadGroups();
  }

  loadGroups() {
    this.httpService.getGroups().subscribe({
      next: (response) => {
        const groups = response.data.map((g: any) => ({
          id: g.uuid || g.id,
          name: g.name
        }));
        this.availableGroups.set(groups);
        this.permissionScopes.set([
          { label: 'Global (todos los grupos)', value: 'global' },
          ...groups.map((g: any) => ({ label: `Grupo: ${g.name}`, value: g.id }))
        ]);
      }
    });
  }

  loadUsers() {
    this.httpService.getUsers().subscribe({
      next: (response) => {
        const mappedUsers = response.data.map((u: any) => ({
          id: u.uuid,
          name: u.name,
          email: u.email,
          role: u.role,
          permissions: (u.permissions || []) as any,
          permissionsByGroup: u.permissionsByGroup || {},
          groups: (u.groups || []).map((g: any) => g.uuid || g.id || g),
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
    alert('Los usuarios se crean a través del proceso de registro');
    this.displayUserDialog = false;
  }

  openPermissionsDialog(user: any) {
    this.selectedUserForPermissions.set(user);
    this.permissionEditState = user.role;
    this.selectedPermissionScope = 'global';
    this.permissionEditStateArray = [...(user.permissions || [])];
    this.displayPermissionsDialog = true;
  }

  onScopeChange() {
    const user = this.selectedUserForPermissions();
    if (!user) return;

    if (this.selectedPermissionScope === 'global') {
      this.permissionEditStateArray = [...(user.permissions || [])];
    } else {
      const groupPerms = user.permissionsByGroup?.[this.selectedPermissionScope] || [];
      this.permissionEditStateArray = [...groupPerms];
    }
  }

  onRoleChange(newRole: string) {
    if (newRole === 'superadmin') this.permissionEditStateArray = [...ALL_PERMISSIONS];
    else if (newRole === 'admin') this.permissionEditStateArray = ['ticket:create' as Permission, 'ticket:edit' as Permission, 'ticket:delete' as Permission, 'ticket:view' as Permission, 'ticket:assign' as Permission, 'ticket:change_status' as Permission, 'ticket:comment' as Permission, 'group:view' as Permission, 'user:create' as Permission, 'user:edit' as Permission, 'user:view' as Permission];
    else this.permissionEditStateArray = ['ticket:view' as Permission, 'ticket:comment' as Permission, 'group:view' as Permission];
  }

  savePermissions() {
    const user = this.selectedUserForPermissions();
    if (!user) {
      return;
    }

    this.saving = true;
    const groupId = this.selectedPermissionScope === 'global' ? undefined : this.selectedPermissionScope;

    this.httpService.updateUserPermissions(
      user.id,
      this.permissionEditStateArray,
      this.permissionEditState,
      groupId
    ).subscribe({
      next: (response) => {
        this.saving = false;
        this.displayPermissionsDialog = false;
        this.loadUsers();

        // If editing own user, update current state
        if (user.id === this.state.currentUser().id) {
          const data = response.data;
          this.state.currentUser.update(u => ({
            ...u,
            role: data.role || u.role,
            permissions: data.permissions || u.permissions,
            permissionsByGroup: data.permissionsByGroup || u.permissionsByGroup
          }));
        }
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving permissions:', err);
        alert('Error al guardar permisos: ' + (err.error?.data?.message || err.message || 'Intenta de nuevo'));
      }
    });
  }

  deleteUser(userId: string) {
    if (userId === this.state.currentUser().id) {
      alert('No puedes eliminarte a ti mismo.');
      return;
    }
    if (confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.httpService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Error al eliminar usuario: ' + (err.message || 'Intenta de nuevo'));
        }
      });
    }
  }
}
