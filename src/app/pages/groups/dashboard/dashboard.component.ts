import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AppStateService, Ticket, TicketStatus, TicketPriority } from '../../../services/app-state.service';
import { HttpService } from '../../../services/http.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TicketDetailComponent } from '../../tickets/detail/ticket-detail.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DialogModule, InputTextModule, FormsModule, TicketDetailComponent],
  template: `
    <div class="page-wrapper animate-in">
      <div class="flex-row-center justify-content-between glass-card p-4 mb-4" style="border-radius: 12px;">
        <div class="flex-row-center gap-3">
          <div class="group-badge-small" [style.backgroundColor]="state.selectedGroup()?.color">
            <span style="color: white; font-weight: bold; font-size: 1.5rem;">{{state.selectedGroup()?.name?.charAt(0)}}</span>
          </div>
          <div>
            <h2 class="view-title m-0">{{state.selectedGroup()?.name}}</h2>
          </div>
        </div>
        <div class="flex-row-center gap-3">
          @if (state.hasPermission('ticket:create')) {
            <p-button label="Crear ticket" icon="pi pi-plus" size="small" styleClass="p-button-success" (onClick)="createNewTicket()"></p-button>
          }
          <p-button label="Kanban" icon="pi pi-clone" size="small" [outlined]="true" severity="secondary" (onClick)="goto('kanban')"></p-button>
          <p-button label="Lista" icon="pi pi-list" size="small" [outlined]="true" severity="secondary" (onClick)="goto('list')"></p-button>
          @if (state.hasPermission('group:edit')) {
            <p-button icon="pi pi-cog" size="small" [outlined]="true" severity="secondary" (onClick)="goto('settings')"></p-button>
          }
        </div>
      </div>

      <div class="profile-stats mb-4">
        <div class="stat-card pending" style="border-bottom: 3px solid #f59e0b;">
          <span class="stat-value">{{pendingTickets().length}}</span>
          <span class="stat-label">Pendiente</span>
        </div>
        <div class="stat-card in-progress" style="border-bottom: 3px solid #3b82f6;">
          <span class="stat-value">{{inProgressTickets().length}}</span>
          <span class="stat-label">En Progreso</span>
        </div>
        <div class="stat-card review" style="border-bottom: 3px solid #6355f7ff;">
          <span class="stat-value">{{reviewTickets().length}}</span>
          <span class="stat-label">Revisión</span>
        </div>
        <div class="stat-card done" style="border-bottom: 3px solid #10b981;">
          <span class="stat-value">{{doneTickets().length}}</span>
          <span class="stat-label">Hecho</span>
        </div>
        <div class="stat-card blocked" style="border-bottom: 3px solid #ef4444;">
          <span class="stat-value">0</span>
          <span class="stat-label">Bloqueado</span>
        </div>
      </div>

      <div class="dashboard-grid">
         <p-card styleClass="glass-card">
           <div class="flex-row-center justify-content-between mb-3 border-bottom pb-2">
             <h3 class="m-0"><i class="pi pi-clock text-secondary mr-2"></i> Tickets Recientes</h3>
             <a href="#" class="text-sm" style="color: var(--p-primary-color); text-decoration: none;" (click)="$event.preventDefault(); goto('list')">Ver todos</a>
           </div>
           
           <table class="ticket-table custom-theme-table">
             <thead>
               <tr>
                 <th>Título</th>
                 <th>Estado</th>
                 <th>Prioridad</th>
                 <th>Asignado</th>
               </tr>
             </thead>
             <tbody>
                @for (t of state.groupTickets().slice(0, 4); track t.id) {
                   <tr class="table-row-hover cursor-pointer" (click)="state.selectedTicketId.set(t.id)">
                      <td>{{t.title}}</td>
                      <td><span class="status-indicator {{'status-' + t.status.toLowerCase().replace(' ', '-')}}">{{t.status}}</span></td>
                      <td><span class="ticket-priority badge-{{t.priority.toLowerCase()}}">{{t.priority}}</span></td>
                      <td>
                         <div class="ticket-assignee-avatar-small" [title]="t.assignedTo">{{t.assignedTo.charAt(0) | uppercase}}</div>
                      </td>
                   </tr>
                }
             </tbody>
           </table>
         </p-card>

         <p-card styleClass="glass-card">
            <div class="flex-row-center justify-content-between mb-3 border-bottom pb-2">
               <h3 class="m-0"><i class="pi pi-user text-secondary mr-2"></i> Mis Tickets</h3>
            </div>
            <div class="empty-state-large mt-4 text-center text-secondary">
               @if (myRecentTickets().length === 0) {
                 Sin tickets asignados
               } @else {
                 @for(t of myRecentTickets(); track t.id) {
                    <div class="text-left mb-2 p-2 border-round cursor-pointer" style="background: rgba(255,255,255,0.05);" (click)="state.selectedTicketId.set(t.id)">
                       <strong>{{t.title}}</strong><br>
                       <small class="text-secondary">{{t.status}} - {{t.dueDate | date:'shortDate'}}</small>
                    </div>
                 }
               }
            </div>
         </p-card>
      </div>

      <!-- Create Ticket Dialog -->
      <p-dialog header="Nuevo Ticket" [(visible)]="isCreateTicketDialogVisible" [modal]="true" [style]="{ width: '400px' }">
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="title" class="font-semibold" style="font-weight: 600;">Título <span style="color: red">*</span></label>
            <input pInputText id="title" [(ngModel)]="newTicket().title" placeholder="Ej. Corregir bug..." class="w-full" />
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="desc" class="font-semibold" style="font-weight: 600;">Descripción</label>
            <textarea id="desc" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().description" rows="3" placeholder="Detalles del ticket..."></textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="status" class="font-semibold" style="font-weight: 600;">Estado Inicial</label>
            <select id="status" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().status">
              @for(status of statusOptions; track status) {
                <option [value]="status">{{status}}</option>
              }
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="priority" class="font-semibold" style="font-weight: 600;">Prioridad</label>
            <select id="priority" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().priority">
              @for(priority of priorityOptions; track priority) {
                <option [value]="priority">{{priority}}</option>
              }
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="assigned" class="font-semibold" style="font-weight: 600;">Asignado a</label>
            <select id="assigned" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().assignedTo">
              <option value="">Sin asignar</option>
              @for(user of state.groupMembers(); track user.uuid) {
                <option [value]="user.uuid">{{user.name}} ({{user.email}})</option>
              }
            </select>
            <div style="display: flex; justify-content: flex-end;">
              <span class="text-xs cursor-pointer" style="color: var(--p-primary-color); text-decoration: underline; font-size: 0.75rem;" (click)="assignToMe()">Asignarme a mí</span>
            </div>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="isCreateTicketDialogVisible.set(false)"></p-button>
          <p-button label="Crear Ticket" (onClick)="saveNewTicket()" [disabled]="!newTicket().title"></p-button>
        </ng-template>
      </p-dialog>

      <app-ticket-detail></app-ticket-detail>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  state = inject(AppStateService);
  router = inject(Router);
  httpService = inject(HttpService);

  pendingTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'todo'));
  inProgressTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'in_progress'));
  reviewTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'in_review'));
  doneTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'done'));

  myRecentTickets = computed(() => {
    return this.state.groupTickets().filter(t => t.assignedTo === this.state.currentUser().email).slice(0, 3);
  });

  ngOnInit() {
    this.loadTicketsFromBackend();
    this.loadGroupMembers();
  }

  loadGroupMembers() {
    const groupId = this.state.selectedGroup()?.id;
    if (!groupId) return;
    this.httpService.getGroup(groupId).subscribe({
      next: (res) => {
        if (res.data && (res.data as any).members) {
          this.state.groupMembers.set((res.data as any).members);
        }
      },
      error: (err) => console.error('Error loading group members:', err)
    });
  }

  loadTicketsFromBackend() {
    const groupId = this.state.selectedGroup()?.id;
    if (!groupId) return;
    this.httpService.getTickets(groupId).subscribe({
      next: (response) => {
        const mapped = response.data.map((t: any) => ({
          id: t.uuid || t.id,
          title: t.title,
          description: t.description || '',
          status: t.status as TicketStatus,
          priority: t.priority as TicketPriority,
          creator: t.creator_email || t.creator || '',
          assignedTo: t.assigned_to_email || t.assignedTo || '',
          assignedToUuid: t.assigned_to_uuid || '',
          assignedToName: t.assigned_to_name || '',
          groupId: groupId,
          dueDate: t.due_date ? new Date(t.due_date) : null,
          startDate: t.start_date ? new Date(t.start_date) : null,
          endDate: t.end_date ? new Date(t.end_date) : null,
          createdAt: t.created_at ? new Date(t.created_at) : new Date(),
          comments: t.comments || [],
          history: t.history || []
        }));
        this.state.allTickets.set(mapped);
      },
      error: (err) => console.error('Error loading tickets:', err)
    });
  }

  isCreateTicketDialogVisible = signal(false);

  statusOptions: TicketStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
  priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

  newTicket = signal<Partial<Ticket>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: ''
  });

  goto(view: string) {
    if (view === 'kanban') this.router.navigate(['/tickets/kanban']);
    if (view === 'list') this.router.navigate(['/tickets/list']);
    if (view === 'settings') this.router.navigate(['/groups/settings']);
  }

  createNewTicket() {
    if (!this.state.hasPermission('ticket:create')) {
      alert('No tienes permiso para crear tickets.');
      return;
    }
    this.newTicket.set({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: ''
    });
    this.isCreateTicketDialogVisible.set(true);
  }

  assignToMe() {
    this.newTicket.update(t => ({ ...t, assignedTo: this.state.currentUser().id }));
  }

  saveNewTicket() {
    if (!this.state.hasPermission('ticket:create')) return;
    const t = this.newTicket();
    if (!t.title) return;

    const groupId = this.state.selectedGroup()?.id || '';

    this.httpService.createTicket({
      title: t.title,
      description: t.description || '',
      status: (t.status as string) || 'todo',
      priority: (t.priority as string) || 'medium',
      assignedToId: t.assignedTo || undefined,
      groupId: groupId,
    } as any).subscribe({
      next: () => {
        this.isCreateTicketDialogVisible.set(false);
        this.loadTicketsFromBackend();
      },
      error: (err) => {
        console.error('Error creating ticket:', err);
        alert('Error al crear el ticket: ' + (err.message || 'Intenta de nuevo'));
      }
    });
  }
}
