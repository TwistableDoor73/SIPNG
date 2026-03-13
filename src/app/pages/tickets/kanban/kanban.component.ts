import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { AppStateService, Ticket, TicketStatus, TicketPriority } from '../../../services/app-state.service';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule],
  template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 glass-card p-3" style="border-radius: 12px;">
        <h2 class="view-title m-0">
           <i class="pi pi-arrow-left text-secondary cursor-pointer mr-2" (click)="router.navigate(['/groups/dashboard'])"></i>
           Tablero Kanban <span style="color:var(--p-primary-color); font-weight: normal; margin-left: 0.5rem">{{state.selectedGroup()?.name}}</span>
        </h2>
        <div class="flex-row-center gap-2">
           <p-button label="Mis tickets" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Sin asignar" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Alta prioridad" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Nuevo" icon="pi pi-plus" size="small" styleClass="p-button-success" (onClick)="createNewTicket()"></p-button>
        </div>
      </div>

      <div class="kanban-board">
          <!-- Pendiente -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('Pendiente', $event)">
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
                  <span class="ticket-priority text-xs p-1" style="color: #ef4444; font-weight: 600" *ngIf="ticket.priority === 'Alta'">crítica</span>
                  <span class="ticket-priority text-xs p-1 text-secondary font-semibold" *ngIf="ticket.priority !== 'Alta'">Sin asignar</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (pendingTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- En Progreso -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('En Progreso', $event)">
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
                  <span class="ticket-priority text-xs p-1" style="color: #f59e0b; font-weight: 600" *ngIf="ticket.priority === 'Alta'">alta</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (inProgressTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- Revisión -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('Revisión', $event)">
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
                  <span class="ticket-priority text-xs p-1" style="color: #f59e0b; font-weight: 600" *ngIf="ticket.priority === 'Alta'">alta</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (reviewTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- Hecho -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('Hecho', $event)">
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
                  <span class="ticket-priority text-xs p-1" style="color: #10b981; font-weight: 600" *ngIf="ticket.priority !== 'Alta'">media</span>
                  <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                </div>
              </div>
              }
              @if (doneTickets().length === 0) { <div class="empty-drop"><small>Arrastra aquí</small></div> }
            </div>
          </div>

          <!-- Bloqueado -->
          <div class="kanban-column" (dragover)="onDragOver($event)" (drop)="onDrop('Bloqueado', $event)">
            <div class="column-header">
               <span><i class="pi pi-ban" style="color: #ef4444"></i> Bloqueado</span>
               <span class="col-count blocked">0</span>
            </div>
            <div class="column-content">
              <div class="empty-drop"><small>Arrastra aquí</small></div>
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

    </div>
  `
})
export class KanbanComponent {
  state = inject(AppStateService);
  router = inject(Router);

  pendingTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'Pendiente'));
  inProgressTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'En Progreso'));
  reviewTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'Revisión'));
  doneTickets = computed(() => this.state.groupTickets().filter(t => t.status === 'Hecho'));

  isCreateTicketDialogVisible = signal(false);
  
  statusOptions: TicketStatus[] = ['Pendiente', 'En Progreso', 'Revisión', 'Hecho', 'Bloqueado'];
  priorityOptions: TicketPriority[] = ['Baja', 'Media', 'Alta'];

  newTicket = signal<Partial<Ticket>>({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    assignedTo: ''
  });

  currentDraggedTicket = signal<Ticket | null>(null);

  onDragStart(ticket: Ticket) {
    this.currentDraggedTicket.set(ticket);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(newStatus: TicketStatus, event: DragEvent) {
    event.preventDefault();
    const ticket = this.currentDraggedTicket();
    if (ticket && ticket.status !== newStatus) {
      this.state.allTickets.update(tickets =>
        tickets.map(t => {
          if (t.id === ticket.id) {
            const updatedTicket = { ...t, status: newStatus };
            updatedTicket.history = [...updatedTicket.history, {
              author: this.state.email(),
              action: `Cambió el estado a ${newStatus}`,
              date: new Date()
            }];
            return updatedTicket;
          }
          return t;
        })
      );
    }
    this.currentDraggedTicket.set(null);
  }

  createNewTicket() {
    this.newTicket.set({
      title: '',
      description: '',
      status: 'Pendiente',
      priority: 'Media',
      assignedTo: ''
    });
    this.isCreateTicketDialogVisible.set(true);
  }

  assignToMe() {
    this.newTicket.update(t => ({...t, assignedTo: this.state.email()}));
  }

  saveNewTicket() {
    const t = this.newTicket();
    if (!t.title) return;
    
    const newId = 'T-' + Math.floor(Math.random() * 10000);
    const ticket: Ticket = {
      id: newId,
      title: t.title,
      description: t.description || '',
      status: t.status as TicketStatus || 'Pendiente',
      priority: t.priority as TicketPriority || 'Media',
      assignedTo: t.assignedTo || 'Sin asignar',
      creator: this.state.email(),
      groupId: this.state.selectedGroup()?.id || '',
      comments: [],
      history: [{
        author: this.state.email(),
        action: 'Creó el ticket',
        date: new Date()
      }],
      createdAt: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
    };
    
    this.state.allTickets.update(tickets => [...tickets, ticket]);
    this.isCreateTicketDialogVisible.set(false);
    
    this.openTicketDetails(ticket);
  }
  
  openTicketDetails(ticket: Ticket) {
    alert(`Abre detalles del ticket ${ticket.id}`);
  }
}
