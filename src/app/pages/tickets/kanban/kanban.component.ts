import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AppStateService, Ticket, TicketStatus, TicketPriority, STATUS_LABELS, PRIORITY_LABELS } from '../../../services/app-state.service';
import { HttpService } from '../../../services/http.service';
import { TicketDetailComponent } from '../detail/ticket-detail.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, TicketDetailComponent],
  template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 glass-card p-3" style="border-radius: 12px;">
        <h2 class="view-title m-0">
           <i class="pi pi-arrow-left text-secondary cursor-pointer mr-2" (click)="router.navigate(['/groups/dashboard'])"></i>
           Tablero Kanban <span style="color:var(--p-primary-color); font-weight: normal; margin-left: 0.5rem">{{state.selectedGroup()?.name}}</span>
        </h2>
        <div class="flex-row-center gap-2">
           <p-button label="Mis tickets" [text]="true" size="small" [severity]="activeFilter() === 'mis_tickets' ? 'primary' : 'secondary'" [styleClass]="activeFilter() === 'mis_tickets' ? '' : 'p-button-outlined'" (onClick)="toggleFilter('mis_tickets')"></p-button>
           <p-button label="Sin asignar" [text]="true" size="small" [severity]="activeFilter() === 'sin_asignar' ? 'primary' : 'secondary'" [styleClass]="activeFilter() === 'sin_asignar' ? '' : 'p-button-outlined'" (onClick)="toggleFilter('sin_asignar')"></p-button>
           <p-button label="Alta prioridad" [text]="true" size="small" [severity]="activeFilter() === 'alta_prioridad' ? 'primary' : 'secondary'" [styleClass]="activeFilter() === 'alta_prioridad' ? '' : 'p-button-outlined'" (onClick)="toggleFilter('alta_prioridad')"></p-button>
            @if (state.hasPermission('ticket:create')) {
              <p-button label="Nuevo" icon="pi pi-plus" size="small" styleClass="p-button-success" (onClick)="createNewTicket()"></p-button>
            }
        </div>
      </div>

      <div class="kanban-board">
          <!-- Pendiente (todo) -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('todo', $event)">
            <div class="column-header">
               <span><i class="pi pi-clock" style="color: #f59e0b"></i> Pendiente</span>
               <span class="col-count pending">{{pendingTickets().length}}</span>
            </div>
            <div class="column-content">
              @for (ticket of pendingTickets(); track ticket.id) {
              <div class="ticket-card kanban-c-pending" draggable="true" (dragstart)="onDragStart(ticket)" (click)="openTicketDetails(ticket)">
                <div class="ticket-title font-bold text-base mb-2">{{ticket.title}}</div>
                <div class="ticket-footer mb-2" style="border-top: none; padding: 0;">
                  <span class="ticket-date text-xs"><i class="pi pi-calendar"></i> {{ticket.dueDate | date:'dd-MMM'}}</span>
                </div>
                <div class="ticket-header mt-auto">
                  <span class="ticket-priority text-xs p-1" style="color: #ef4444; font-weight: 600" *ngIf="ticket.priority === 'high' || ticket.priority === 'urgent'">{{priorityLabel(ticket.priority)}}</span>
                  <span class="ticket-priority text-xs p-1 text-secondary font-semibold" *ngIf="ticket.priority !== 'high' && ticket.priority !== 'urgent'">{{priorityLabel(ticket.priority)}}</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (pendingTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- En Progreso (in_progress) -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('in_progress', $event)">
            <div class="column-header">
               <span><i class="pi pi-circle" style="color: #3b82f6"></i> En Progreso</span>
               <span class="col-count in-progress">{{inProgressTickets().length}}</span>
            </div>
            <div class="column-content">
              @for (ticket of inProgressTickets(); track ticket.id) {
              <div class="ticket-card kanban-c-progress" draggable="true" (dragstart)="onDragStart(ticket)" (click)="openTicketDetails(ticket)">
                <div class="ticket-title font-bold text-base mb-2">{{ticket.title}}</div>
                <div class="ticket-footer mb-2" style="border-top: none; padding: 0;">
                  <span class="ticket-date text-xs"><i class="pi pi-calendar"></i> {{ticket.dueDate | date:'dd-MMM'}}</span>
                </div>
                <div class="ticket-header mt-auto">
                  <span class="ticket-priority text-xs p-1" style="color: #f59e0b; font-weight: 600" *ngIf="ticket.priority === 'high' || ticket.priority === 'urgent'">{{priorityLabel(ticket.priority)}}</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (inProgressTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- Revisión (in_review) -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('in_review', $event)">
            <div class="column-header">
               <span><i class="pi pi-eye" style="color: #a855f7"></i> Revisión</span>
               <span class="col-count review">{{reviewTickets().length}}</span>
            </div>
            <div class="column-content">
              @for (ticket of reviewTickets(); track ticket.id) {
              <div class="ticket-card kanban-c-review" draggable="true" (dragstart)="onDragStart(ticket)" (click)="openTicketDetails(ticket)">
                <div class="ticket-title font-bold text-base mb-2">{{ticket.title}}</div>
                <div class="ticket-footer mb-2" style="border-top: none; padding: 0;">
                  <span class="ticket-date text-xs"><i class="pi pi-calendar"></i> {{ticket.dueDate | date:'dd-MMM'}}</span>
                </div>
                <div class="ticket-header mt-auto">
                  <span class="ticket-priority text-xs p-1" style="color: #f59e0b; font-weight: 600" *ngIf="ticket.priority === 'high' || ticket.priority === 'urgent'">{{priorityLabel(ticket.priority)}}</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (reviewTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- Hecho (done) -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('done', $event)">
            <div class="column-header">
               <span><i class="pi pi-check-circle" style="color: #10b981"></i> Hecho</span>
               <span class="col-count done">{{doneTickets().length}}</span>
            </div>
            <div class="column-content">
              @for (ticket of doneTickets(); track ticket.id) {
              <div class="ticket-card kanban-c-done" draggable="true" (dragstart)="onDragStart(ticket)" (click)="openTicketDetails(ticket)">
                <div class="ticket-title font-bold text-base mb-2">{{ticket.title}}</div>
                <div class="ticket-footer mb-2" style="border-top: none; padding: 0;">
                  <span class="ticket-date text-xs"><i class="pi pi-calendar"></i> {{ticket.dueDate | date:'dd-MMM'}}</span>
                </div>
                <div class="ticket-header mt-auto">
                  <span class="ticket-priority text-xs p-1" style="color: #10b981; font-weight: 600">{{priorityLabel(ticket.priority)}}</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (doneTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>
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
                <option [value]="status">{{statusLabel(status)}}</option>
              }
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="priority" class="font-semibold" style="font-weight: 600;">Prioridad</label>
            <select id="priority" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().priority">
              @for(priority of priorityOptions; track priority) {
                <option [value]="priority">{{priorityLabel(priority)}}</option>
              }
            </select>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <label for="assigned" class="font-semibold" style="font-weight: 600;">Asignado a</label>
            <select id="assigned" class="p-inputtext p-component w-full" [(ngModel)]="newTicket().assignedTo">
              <option value="">Sin asignar</option>
              @for(user of state.groupMembers(); track user.id) {
                <option [value]="user.email">{{user.name}}</option>
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
export class KanbanComponent implements OnInit {
  state = inject(AppStateService);
  router = inject(Router);
  httpService = inject(HttpService);

  activeFilter = signal<'mis_tickets' | 'sin_asignar' | 'alta_prioridad' | null>(null);

  filteredTickets = computed(() => {
    let tickets = this.state.groupTickets();
    const filter = this.activeFilter();
    
    if (filter === 'mis_tickets') {
      tickets = tickets.filter(t => t.assignedTo === this.state.email());
    } else if (filter === 'sin_asignar') {
      tickets = tickets.filter(t => !t.assignedTo || t.assignedTo === 'Sin asignar');
    } else if (filter === 'alta_prioridad') {
      tickets = tickets.filter(t => t.priority === 'high' || t.priority === 'urgent');
    }
    
    return tickets;
  });

  pendingTickets = computed(() => this.filteredTickets().filter(t => t.status === 'todo'));
  inProgressTickets = computed(() => this.filteredTickets().filter(t => t.status === 'in_progress'));
  reviewTickets = computed(() => this.filteredTickets().filter(t => t.status === 'in_review'));
  doneTickets = computed(() => this.filteredTickets().filter(t => t.status === 'done'));

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

  currentDraggedTicket = signal<Ticket | null>(null);

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

  toggleFilter(filter: 'mis_tickets' | 'sin_asignar' | 'alta_prioridad') {
    if (this.activeFilter() === filter) {
      this.activeFilter.set(null); // Toggle off
    } else {
      this.activeFilter.set(filter); // Toggle on
    }
  }

  onDragStart(ticket: Ticket) {
    if (!this.state.hasPermission('ticket:change_status')) return;
    this.currentDraggedTicket.set(ticket);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(newStatus: TicketStatus, event: DragEvent) {
    event.preventDefault();
    if (!this.state.hasPermission('ticket:change_status')) {
      alert('No tienes permiso para cambiar el estado de los tickets.');
      return;
    }
    const ticket = this.currentDraggedTicket();
    if (ticket && ticket.status !== newStatus) {
      // Update backend
      this.httpService.updateTicket(ticket.id, { status: newStatus } as any).subscribe({
        next: () => {
          this.state.allTickets.update(tickets =>
            tickets.map(t => {
              if (t.id === ticket.id) {
                const updatedTicket = { ...t, status: newStatus };
                updatedTicket.history = [...updatedTicket.history, {
                  author: this.state.email(),
                  action: `Cambió el estado a ${STATUS_LABELS[newStatus]}`,
                  date: new Date()
                }];
                return updatedTicket;
              }
              return t;
            })
          );
        },
        error: (err) => {
          console.error('Error updating ticket status:', err);
          alert('Error al actualizar el estado del ticket');
        }
      });
    }
    this.currentDraggedTicket.set(null);
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
    this.newTicket.update(t => ({...t, assignedTo: this.state.email()}));
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
      groupId: groupId,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
    } as any).subscribe({
      next: (response) => {
        this.isCreateTicketDialogVisible.set(false);
        this.loadTicketsFromBackend();
      },
      error: (err) => {
        console.error('Error creating ticket:', err);
        alert('Error al crear el ticket: ' + (err.message || 'Intenta de nuevo'));
      }
    });
  }
  
  openTicketDetails(ticket: Ticket) {
    this.state.selectedTicketId.set(ticket.id);
  }

  statusLabel(status: TicketStatus): string {
    return STATUS_LABELS[status] || status;
  }

  priorityLabel(priority: TicketPriority): string {
    return PRIORITY_LABELS[priority] || priority;
  }
}
