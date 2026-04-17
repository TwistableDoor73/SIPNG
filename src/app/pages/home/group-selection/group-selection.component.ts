import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AppStateService, Group } from '../../../services/app-state.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-group-selection',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, InputTextModule, FormsModule],
  template: `
    <div class="page-wrapper animate-in">
      <div class="page-header mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold">Mis Grupos</h2>
            <p class="text-secondary">Selecciona un espacio de trabajo</p>
          </div>
          @if (state.hasPermission('group:create')) {
            <p-button label="Crear nuevo" icon="pi pi-plus" (click)="openCreateGroupDialog()"></p-button>
          }
        </div>
      </div>

      @if (groups().length === 0) {
        <div class="glass-card p-8 text-center">
          <p class="text-secondary">No tienes acceso a ningún grupo todavía</p>
        </div>
      } @else {
        <div class="groups-grid mt-4">
          @for (group of groups(); track group.id) {
          <p-card styleClass="glass-card group-card cursor-pointer hover:scale-105 transition-transform" (click)="onSelectGroup(group)">
            <div class="group-content">
              <div class="group-icon text-4xl mb-3" [style.color]="group.color">
                <i class="pi" [ngClass]="group.icon"></i>
              </div>
              <h3 class="text-xl font-bold">{{group.name}}</h3>
              <p class="text-secondary text-sm mt-2">{{group.description}}</p>
            </div>
          </p-card>
          }
        </div>
      }
    </div>

    <!-- Dialog para crear grupo -->
    <p-dialog [(visible)]="displayCreateDialog" [modal]="true" [style]="{ width: '400px' }" header="Crear nuevo grupo">
      <div class="space-y-4">
        <div>
          <label class="block text-sm mb-2">Nombre del grupo *</label>
          <input pInputText class="w-full" [(ngModel)]="newGroup.name" placeholder="Nombre" />
        </div>
        <div>
          <label class="block text-sm mb-2">Descripción</label>
          <input pInputText class="w-full" [(ngModel)]="newGroup.description" placeholder="Descripción" />
        </div>
        <div>
          <label class="block text-sm mb-2">Color</label>
          <input type="color" class="w-full p-2 rounded" [(ngModel)]="newGroup.color" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <p-button label="Cancelar" severity="secondary" (click)="displayCreateDialog = false"></p-button>
          <p-button label="Crear" (click)="createGroup()"></p-button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .page-wrapper { padding: 2rem; }
    .page-header { display: flex; flex-direction: column; }
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .group-content { padding: 1.5rem; }
    .text-secondary { color: #94a3b8; }
    .glass-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(148, 163, 184, 0.1); }
    .w-full { width: 100%; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .gap-2 { gap: 0.5rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .cursor-pointer { cursor: pointer; }
    .rounded { border-radius: 0.375rem; }
    .p-2 { padding: 0.5rem; }
    .p-8 { padding: 2rem; }
    .text-center { text-align: center; }
    .text-3xl { font-size: 1.875rem; }
    .text-xl { font-size: 1.25rem; }
    .text-sm { font-size: 0.875rem; }
    .font-bold { font-weight: bold; }
  `]
})
export class GroupSelectionComponent implements OnInit {
  state = inject(AppStateService);
  router = inject(Router);
  httpService = inject(HttpService);

  groups = signal<Group[]>([]);
  displayCreateDialog = false;
  newGroup = {
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'pi-briefcase'
  };

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.httpService.getGroups().subscribe({
      next: (response) => {
        const userGroups = this.state.currentUser()?.groups || [];
        const mappedGroups = response.data
          .filter((g: any) => userGroups.includes(g.uuid) || userGroups.includes(g.id))
          .map((g: any) => ({
            id: g.uuid || g.id,
            name: g.name,
            description: g.description || '',
            color: g.color || '#6366f1',
            icon: g.icon || 'pi-briefcase'
          }));
        this.groups.set(mappedGroups);
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  openCreateGroupDialog() {
    this.newGroup = { name: '', description: '', color: '#6366f1', icon: 'pi-briefcase' };
    this.displayCreateDialog = true;
  }

  createGroup() {
    if (!this.newGroup.name.trim()) {
      alert('El nombre del grupo es obligatorio');
      return;
    }

    this.httpService.createGroup({
      name: this.newGroup.name,
      description: this.newGroup.description,
      color: this.newGroup.color,
      icon: this.newGroup.icon
    }).subscribe({
      next: (response) => {
        alert('Grupo creado exitosamente');
        this.displayCreateDialog = false;
        this.loadGroups();
      },
      error: (error) => {
        alert('Error al crear el grupo: ' + (error.message || 'Por favor intenta de nuevo'));
      }
    });
  }

  onSelectGroup(group: Group) {
    this.state.selectGroup(group);
    this.router.navigate(['/groups/dashboard']);
  }
}
