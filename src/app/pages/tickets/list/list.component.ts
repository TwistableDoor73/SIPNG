import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AppStateService, Ticket } from '../../../services/app-state.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule],
  template: `
    <div class="page-wrapper animate-in full-height-view">
      <div class="flex-row-center justify-content-between mb-4 glass-card p-3" style="border-radius: 12px;">
        <div class="flex-row-center gap-3 w-6">
           <h2 class="view-title m-0 white-space-nowrap">
              <i class="pi pi-arrow-left text-secondary cursor-pointer mr-2" (click)="router.navigate(['/groups/dashboard'])"></i> 
              Lista de Tickets <span style="color:var(--p-primary-color); font-weight: normal; margin-left: 0.5rem">{{state.selectedGroup()?.name}}</span>
           </h2>
           
           <!-- Search box placeholder -->
           <span class="p-input-icon-left w-full max-w-20rem ml-3">
               <i class="pi pi-search"></i>
               <input type="text" pInputText placeholder="Buscar..." class="w-full" />
           </span>
        </div>
        <div class="flex-row-center gap-2">
           <p-button label="Mis tickets" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Sin asignar" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Alta prioridad" [text]="true" size="small" severity="secondary" styleClass="p-button-outlined"></p-button>
           <p-button label="Nuevo" icon="pi pi-plus" size="small" styleClass="p-button-success" (onClick)="createNewTicket()"></p-button>
        </div>
      </div>

      <div class="table-container glass-card list-bg py-2">
        <table class="ticket-table custom-theme-table list-table">
          <thead>
            <tr>
              <th (click)="toggleSort('id')" class="sortable">ID ⇕</th>
              <th (click)="toggleSort('title')" class="sortable">Título ⇕</th>
              <th (click)="toggleSort('status')" class="sortable text-center">Estado ⇕</th>
              <th (click)="toggleSort('priority')" class="sortable">Prioridad</th>
              <th (click)="toggleSort('assignedTo')" class="sortable">Asignado a</th>
              <th (click)="toggleSort('dueDate')" class="sortable">Fecha límite ⇕</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @if (sortedTickets().length === 0) {
              <tr><td colspan="7" class="text-center p-4">No se encontraron tickets.</td></tr>
            }
            @for (ticket of sortedTickets(); track ticket.id; let i = $index) {
            <tr class="table-row">
              <td class="text-secondary text-sm">t{{i + 1}}</td>
              <td class="font-semibold" style="color: #6366f1">{{ticket.title}}</td>
              <td class="text-center"><span class="status-indicator {{'status-' + ticket.status.toLowerCase().replace(' ', '-')}}">{{ticket.status}}</span></td>
              <td>
                 <span *ngIf="ticket.priority === 'Alta'" class="text-red-500 font-bold text-sm">crítica</span>
                 <span *ngIf="ticket.priority === 'Media'" class="text-green-500 font-bold text-sm">media</span>
                 <span *ngIf="ticket.priority === 'Baja'" class="text-yellow-500 font-bold text-sm">baja</span>
              </td>
              <td>
                 <div class="flex-row-center gap-2">
                    <div class="ticket-assignee-avatar" [title]="ticket.assignedTo">{{ticket.assignedTo.charAt(0) | uppercase}}</div>
                    <small>{{ticket.assignedTo.split('@')[0]}}</small>
                 </div>
              </td>
              <td class="text-sm">{{ticket.dueDate | date:'dd MMM yyyy'}}</td>
              <td class="text-center">
                 <div class="flex-row-center justify-content-center gap-3">
                   <i class="pi pi-eye text-green-500 cursor-pointer" (click)="openTicketDetails(ticket)"></i>
                   <i class="pi pi-trash text-red-500 cursor-pointer"></i>
                 </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
        <div class="flex-row-center justify-content-center mt-3 text-secondary text-sm gap-3">
           <i class="pi pi-angle-double-left cursor-pointer"></i>
           <i class="pi pi-angle-left cursor-pointer"></i>
           <span class="pagination-active">1</span>
           <i class="pi pi-angle-right cursor-pointer"></i>
           <i class="pi pi-angle-double-right cursor-pointer"></i>
        </div>
      </div>
    </div>
  `
})
export class ListComponent {
  state = inject(AppStateService);
  router = inject(Router);

  sortField = signal<keyof Ticket>('createdAt');
  sortAscending = signal<boolean>(false);

  get sortedTickets() {
    return () => {
      let tickets = [...this.state.groupTickets()];
      tickets.sort((a: any, b: any) => {
        let valA = a[this.sortField()];
        let valB = b[this.sortField()];
        if (valA < valB) return this.sortAscending() ? -1 : 1;
        if (valA > valB) return this.sortAscending() ? 1 : -1;
        return 0;
      });
      return tickets;
    };
  }

  toggleSort(field: keyof Ticket) {
    if (this.sortField() === field) {
      this.sortAscending.set(!this.sortAscending());
    } else {
      this.sortField.set(field);
      this.sortAscending.set(true);
    }
  }

  createNewTicket() {
    alert("Crear ticket UI no implementada en standalone aún.");
  }

  openTicketDetails(ticket: Ticket) {
    alert(`Ver ticket UI no implementada: ${ticket.title}`);
  }
}
