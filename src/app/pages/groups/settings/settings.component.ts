import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AppStateService } from '../../../services/app-state.service';

@Component({
   selector: 'app-settings',
   standalone: true,
   imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule],
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
               <input pInputText class="w-full custom-input-filled" [ngModel]="state.selectedGroup()?.name" disabled />
            </div>
            <div class="field mb-3">
               <label class="block mb-2 font-semibold text-sm">Descripción</label>
               <input pInputText class="w-full custom-input-filled" [ngModel]="state.selectedGroup()?.description" disabled />
            </div>
            
            <div class="field mb-4">
                 <label class="block mb-2 font-semibold text-sm">Color</label>
                 <div class="color-preview" [style.backgroundColor]="state.selectedGroup()?.color"></div>
            </div>
            
            <p-button label="Guardar configuración" size="small" styleClass="p-button-success mb-4" (onClick)="updateGroupConfig()"></p-button>
            
            <hr style="border-color: rgba(255,255,255,0.05); margin: 1.5rem 0;" />
            
            <h4 class="text-red-400 mt-0 mb-2">Zona de peligro</h4>
            <p class="text-xs text-secondary mb-3">Eliminar el grupo eliminará toda su información permanentemente.</p>
            <p-button label="Eliminar grupo" icon="pi pi-trash" [outlined]="true" severity="danger" size="small" (onClick)="deleteGroup()"></p-button>
         </p-card>

         <!-- Lista de Miembros -->
         <p-card styleClass="glass-card full-height-card">
             <div class="flex-row-center justify-content-between mb-4">
                <h3 class="m-0"><i class="pi pi-users text-secondary mr-2"></i> Miembros ({{state.groupMembers().length}})</h3>
                <p-button label="Añadir miembro" icon="pi pi-user-plus" size="small" styleClass="p-button-success" (onClick)="addUserToGroup()"></p-button>
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
                   @for (mem of state.groupMembers(); track mem.id) {
                   <tr class="table-row-hover">
                      <td>
                         <div class="flex-row-center gap-3">
                           <div class="user-avatar-small" [style.backgroundImage]="'url(' + mem.avatarUrl + ')'" style="width: 32px; height: 32px;">
                             <span *ngIf="!mem.avatarUrl" class="text-sm font-bold">{{mem.name.charAt(0)}}</span>
                           </div>
                           <div>
                              <strong>{{mem.name}}</strong><br>
                              <small class="text-secondary">{{mem.role}}</small>
                           </div>
                         </div>
                      </td>
                      <td class="text-secondary text-sm">{{mem.email}}</td>
                      <td class="text-center"><span class="badge-rounded-light">{{mem.permissions.length}} permisos</span></td>
                      <td class="text-right">
                         <i class="pi pi-user-minus text-red-500 cursor-pointer" (click)="removeUserFromGroup(mem.id)" title="Eliminar del grupo"></i>
                      </td>
                   </tr>
                   }
                </tbody>
             </table>
         </p-card>
      </div>
      }
    </div>
  `
})
export class SettingsComponent {
   state = inject(AppStateService);
   router = inject(Router);

   updateGroupConfig() {
      alert('Configuración guardada correctamente.');
   }

   deleteGroup() {
      alert('Acción bloqueada: Requiere confirmación del servidor.');
   }

   addUserToGroup() {
      alert('Esta funcionalidad será adaptada a un modal de búsqueda.');
   }

   removeUserFromGroup(id: string) {
      const group = this.state.selectedGroup();
      if (!group) return;
      this.state.systemUsers.update(users => users.map(u => {
         if (u.id === id) {
            return { ...u, groups: u.groups.filter(gid => gid !== group.id) };
         }
         return u;
      }));
   }
}
