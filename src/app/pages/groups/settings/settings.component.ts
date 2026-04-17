import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AppStateService } from '../../../services/app-state.service';
import { HttpService } from '../../../services/http.service';

@Component({
   selector: 'app-settings',
   standalone: true,
   imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule, DialogModule, SelectModule, ColorPickerModule],
   template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 glass-card p-3" style="border-radius: 12px;">
        <h2 class="view-title m-0">
           <i class="pi pi-arrow-left text-secondary cursor-pointer mr-2" (click)="router.navigate(['/groups/dashboard'])"></i> 
           Gestión del Grupo <span style="color:var(--p-primary-color); font-weight: normal; margin-left: 0.5rem">{{state.selectedGroup()?.name}}</span>
        </h2>
      </div>
      
      @if (state.selectedGroup()) {
      <div class="settings-grid">
         <!-- Formulario de Config -->
         <p-card styleClass="glass-card">
            <h3 class="mt-0 mb-4"><i class="pi pi-cog text-secondary mr-2"></i> Configuración</h3>
            
            <div class="field mb-3">
               <label class="block mb-2 font-semibold text-sm">Nombre del grupo</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="editName" [disabled]="!state.hasPermission('group:edit')" />
            </div>
            <div class="field mb-3">
               <label class="block mb-2 font-semibold text-sm">Descripción</label>
               <input pInputText class="w-full custom-input-filled" [(ngModel)]="editDescription" [disabled]="!state.hasPermission('group:edit')" />
            </div>
            
            <div class="field mb-4">
                 <label class="block mb-2 font-semibold text-sm">Color</label>
                 <p-colorPicker [(ngModel)]="editColor" [disabled]="!state.hasPermission('group:edit')"></p-colorPicker>
            </div>
            
            @if (state.hasPermission('group:edit')) {
              <p-button label="Guardar configuración" size="small" styleClass="p-button-success mb-4" (onClick)="updateGroupConfig()" [disabled]="savingConfig()"></p-button>
              @if (configSuccess()) {
                <small style="color: #10b981; margin-left: 0.5rem;">{{configSuccess()}}</small>
              }
              @if (configError()) {
                <small style="color: #ef4444; margin-left: 0.5rem;">{{configError()}}</small>
              }
            }
            
            @if (state.hasPermission('group:delete')) {
               <hr style="border-color: rgba(255,255,255,0.05); margin: 1.5rem 0;" />
               <h4 class="text-red-400 mt-0 mb-2">Zona de peligro</h4>
               <p class="text-xs text-secondary mb-3">Eliminar el grupo eliminará toda su información permanentemente.</p>
               <p-button label="Eliminar grupo" icon="pi pi-trash" [outlined]="true" severity="danger" size="small" (onClick)="deleteGroup()"></p-button>
            }
         </p-card>

         <!-- Lista de Miembros -->
         <p-card styleClass="glass-card full-height-card">
             <div class="flex-row-center justify-content-between mb-4">
                <h3 class="m-0"><i class="pi pi-users text-secondary mr-2"></i> Miembros ({{members().length}})</h3>
                @if (state.hasPermission('group:add_member')) {
                   <p-button label="Añadir miembro" icon="pi pi-user-plus" size="small" styleClass="p-button-success" (onClick)="addUserToGroup()"></p-button>
                }
             </div>

             <table class="ticket-table custom-theme-table fill-parent">
                <thead>
                   <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th class="text-center">Permisos</th>
                      <th></th>
                   </tr>
                </thead>
                <tbody>
                   @for (mem of members(); track mem.id) {
                   <tr class="table-row-hover">
                      <td>
                         <div class="flex-row-center gap-3">
                           <div class="user-avatar-small" [style.backgroundImage]="mem.avatar_url ? 'url(' + mem.avatar_url + ')' : 'none'" style="width: 32px; height: 32px; background-size: cover; border-radius: 50%;">
                             <span *ngIf="!mem.avatar_url" class="text-sm font-bold">{{mem.name.charAt(0)}}</span>
                           </div>
                           <div>
                              <strong>{{mem.name}}</strong><br>
                              <small class="text-secondary">{{mem.role}}</small>
                           </div>
                         </div>
                      </td>
                      <td class="text-secondary text-sm">{{mem.email}}</td>
                      <td class="text-center"><span class="badge-rounded-light">{{(mem.permissions || []).length}} permisos</span></td>
                      <td class="text-right">
                         @if (state.hasPermission('group:remove_member')) {
                            <i class="pi pi-user-minus text-red-500 cursor-pointer" (click)="removeUserFromGroup(mem.uuid)" title="Eliminar del grupo"></i>
                         }
                      </td>
                   </tr>
                   }
                </tbody>
             </table>
         </p-card>
      </div>
      }

      <!-- Add Member Dialog -->
      <p-dialog header="Añadir miembro al grupo" [(visible)]="showAddMemberDialog" [modal]="true" [style]="{ width: '450px' }">
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label class="font-semibold" style="font-weight: 600;">Seleccionar usuario</label>
            <p-select
              [(ngModel)]="selectedUserId"
              [options]="availableUsers()"
              optionLabel="label"
              optionValue="value"
              placeholder="Buscar usuario..."
              [filter]="true"
              filterBy="label"
              [style]="{ width: '100%' }"
              appendTo="body">
              <ng-template pTemplate="item" let-item>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--p-primary-color); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; color: white;">
                    {{item.label.charAt(0)}}
                  </div>
                  <div>
                    <div style="font-weight: 500;">{{item.label}}</div>
                    <small style="opacity: 0.6;">{{item.email}}</small>
                  </div>
                </div>
              </ng-template>
            </p-select>
          </div>
          @if (addMemberError()) {
            <small style="color: #ef4444;">{{addMemberError()}}</small>
          }
          @if (addMemberSuccess()) {
            <small style="color: #10b981;">{{addMemberSuccess()}}</small>
          }
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="showAddMemberDialog = false"></p-button>
          <p-button label="Añadir" icon="pi pi-user-plus" (onClick)="confirmAddMember()" [disabled]="!selectedUserId || addingMember()"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class SettingsComponent {
   state = inject(AppStateService);
   router = inject(Router);
   httpService = inject(HttpService);

   members = signal<any[]>([]);
   allUsers = signal<any[]>([]);
   showAddMemberDialog = false;
   selectedUserId: string | null = null;
   addMemberError = signal('');
   addMemberSuccess = signal('');
   addingMember = signal(false);

   // Group editing
   editName = '';
   editDescription = '';
   editColor = '';
   savingConfig = signal(false);
   configSuccess = signal('');
   configError = signal('');

   availableUsers = computed(() => {
     const memberUuids = new Set(this.members().map(m => m.uuid));
     return this.allUsers()
       .filter(u => !memberUuids.has(u.uuid))
       .map(u => ({ label: u.name, value: u.uuid, email: u.email }));
   });

   constructor() {
     effect(() => {
       const group = this.state.selectedGroup();
       if (group?.id) {
         this.editName = group.name;
         this.editDescription = group.description || '';
         this.editColor = group.color || '#6366f1';
         this.loadMembers(group.id);
       } else {
         this.members.set([]);
       }
     });
     this.loadAllUsers();
   }

   loadAllUsers() {
     this.httpService.getUsers().subscribe({
       next: (res) => {
         if (res.data) {
           this.allUsers.set(res.data);
         }
       },
       error: (err) => console.error('Error loading users:', err)
     });
   }

   loadMembers(groupId: string) {
     this.httpService.getGroup(groupId).subscribe({
       next: (res) => {
         if (res.data && (res.data as any).members) {
           this.members.set((res.data as any).members);
         }
       },
       error: (err) => console.error(err)
     });
   }

   updateGroupConfig() {
      if (!this.state.hasPermission('group:edit')) return;

      const groupId = this.state.selectedGroup()?.id;
      if (!groupId) return;

      this.savingConfig.set(true);
      this.configSuccess.set('');
      this.configError.set('');

      const updates: any = {};
      const group = this.state.selectedGroup()!;
      if (this.editName !== group.name) updates.name = this.editName;
      if (this.editDescription !== (group.description || '')) updates.description = this.editDescription;
      if (this.editColor !== (group.color || '')) updates.color = this.editColor;

      if (Object.keys(updates).length === 0) {
        this.savingConfig.set(false);
        this.configSuccess.set('No hay cambios para guardar.');
        return;
      }

      this.httpService.updateGroup(groupId, updates).subscribe({
        next: (res) => {
          this.savingConfig.set(false);
          this.configSuccess.set('Configuración guardada correctamente.');
          // Update local state
          if (res.data) {
            this.state.selectedGroup.set({ ...group, ...updates });
          }
        },
        error: (err) => {
          this.savingConfig.set(false);
          this.configError.set(err.message || 'Error al guardar configuración');
        }
      });
   }

   deleteGroup() {
      if (!this.state.hasPermission('group:delete')) return;

      if (!confirm('¿Eliminar este grupo? Se eliminarán todos los tickets y datos asociados. Esta acción no se puede deshacer.')) return;

      const groupId = this.state.selectedGroup()?.id;
      if (!groupId) return;

      this.httpService.deleteGroup(groupId).subscribe({
        next: () => {
          this.state.selectedGroup.set(null);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error deleting group:', err);
          alert('Error al eliminar grupo: ' + (err.message || 'Intenta de nuevo'));
        }
      });
   }

   addUserToGroup() {
      if (!this.state.hasPermission('group:add_member')) return;
      this.selectedUserId = null;
      this.addMemberError.set('');
      this.addMemberSuccess.set('');
      this.showAddMemberDialog = true;
   }

   confirmAddMember() {
      if (!this.selectedUserId) return;

      const groupId = this.state.selectedGroup()?.id;
      if (!groupId) return;

      this.addingMember.set(true);
      this.addMemberError.set('');
      this.addMemberSuccess.set('');

      this.httpService.addGroupMember(groupId, this.selectedUserId).subscribe({
        next: (res) => {
          this.addingMember.set(false);
          this.addMemberSuccess.set(`${res.data.name || 'Usuario'} añadido al grupo.`);
          this.selectedUserId = null;
          this.loadMembers(groupId);
        },
        error: (err) => {
          this.addingMember.set(false);
          const msg = err.message || 'Error al añadir miembro';
          if (msg.includes('already a member') || msg.includes('409')) {
            this.addMemberError.set('Este usuario ya es miembro del grupo.');
          } else if (msg.includes('not found') || msg.includes('404')) {
            this.addMemberError.set('No se encontró el usuario.');
          } else {
            this.addMemberError.set(msg);
          }
        }
      });
   }

   removeUserFromGroup(userUuid: string) {
      if (!this.state.hasPermission('group:remove_member')) {
         alert('No tienes permiso para eliminar miembros del grupo.');
         return;
      }

      if (!confirm('¿Estás seguro de que quieres eliminar a este miembro del grupo?')) return;

      const groupId = this.state.selectedGroup()?.id;
      if (!groupId) return;

      this.httpService.removeGroupMember(groupId, userUuid).subscribe({
        next: () => {
          this.loadMembers(groupId);
        },
        error: (err) => {
          alert('Error al eliminar miembro: ' + (err.message || 'Intenta de nuevo'));
        }
      });
   }
}
