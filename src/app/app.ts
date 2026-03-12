import { Component, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';

interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  llmModel: string;
  icon: string;
}

export type TicketStatus = 'Pendiente' | 'En Progreso' | 'Revisión' | 'Hecho';
export type TicketPriority = 'Baja' | 'Media' | 'Alta';

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  assignedTo: string;
  groupId: string;
  priority: TicketPriority;
  dueDate: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    BadgeModule,
    DialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isAuthenticated = signal(false);
  selectedGroup: WritableSignal<Group | null> = signal(null);

  email = signal('usuario@ejemplo.com');
  password = signal('password123');

  // Permission system (Mock: assigned to the logged in user)
  userPermissions = signal<string[]>(['create_ticket', 'view_kanban']);

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  groups: Group[] = [
    { id: '1', name: 'Equipo Dev', description: 'Desarrollo, análisis de código y arquitectura.', color: '#0ea5e9', llmModel: 'OpenAI GPT-4o', icon: 'pi-code' },
    { id: '2', name: 'Soporte', description: 'Sistema de atención y resolución de dudas.', color: '#10b981', llmModel: 'Claude 3.5 Sonnet', icon: 'pi-headphones' },
    { id: '3', name: 'UX & Diseño', description: 'Diseño de interfaces e ideación.', color: '#ec4899', llmModel: 'Google Gemini 1.5 Pro', icon: 'pi-palette' }
  ];

  allTickets: WritableSignal<Ticket[]> = signal([
    { id: 'T-01', title: 'Corregir bug de login', status: 'En Progreso', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Media', dueDate: new Date(2026, 3, 10), createdAt: new Date() },
    { id: 'T-02', title: 'Actualizar dependencias', status: 'Hecho', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Baja', dueDate: new Date(2026, 3, 5), createdAt: new Date() },
    { id: 'T-03', title: 'Implementar oAuth', status: 'Pendiente', assignedTo: 'dev2@ejemplo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 15), createdAt: new Date() },
    { id: 'T-04', title: 'Error en despliegue', status: 'Revisión', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 12), createdAt: new Date() },
    { id: 'T-05', title: 'Revisar tickets atrasados', status: 'Pendiente', assignedTo: 'soporte1@ejemplo.com', groupId: '2', priority: 'Media', dueDate: new Date(2026, 3, 20), createdAt: new Date() }
  ]);

  // Drag and Drop state
  currentDraggedTicket = signal<Ticket | null>(null);

  // Modal State
  displayTicketDialog = signal(false);
  selectedTicket = signal<Ticket | null>(null);

  // Options for dropdowns
  statusOptions = ['Pendiente', 'En Progreso', 'Revisión', 'Hecho'];
  priorityOptions = ['Baja', 'Media', 'Alta'];

  // Computed signals for the selected group's tickets
  groupTickets = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.allTickets().filter(t => t.groupId === group.id);
  });

  pendingTickets = computed(() => this.groupTickets().filter(t => t.status === 'Pendiente'));
  inProgressTickets = computed(() => this.groupTickets().filter(t => t.status === 'En Progreso'));
  reviewTickets = computed(() => this.groupTickets().filter(t => t.status === 'Revisión'));
  doneTickets = computed(() => this.groupTickets().filter(t => t.status === 'Hecho'));

  // Mini-list for user
  myRecentTickets = computed(() => {
    return this.groupTickets().filter(t => t.assignedTo === this.email()).slice(0, 3);
  });

  login() {
    if (this.email() && this.password()) {
      this.isAuthenticated.set(true);
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.selectedGroup.set(null);
  }

  selectGroup(group: Group) {
    this.selectedGroup.set(group);
  }

  backToGroups() {
    this.selectedGroup.set(null);
  }

  createNewTicket() {
    alert("Acción: Crear nuevo ticket (Requiere UI Adicional)");
  }

  // --- Drag and Drop Logic ---
  onDragStart(ticket: Ticket) {
    this.currentDraggedTicket.set(ticket);
  }

  onDrop(newStatus: TicketStatus, event: DragEvent) {
    event.preventDefault(); // allow drop
    const ticket = this.currentDraggedTicket();
    if (ticket && ticket.status !== newStatus) {
      // Find and update the ticket in the allTickets array
      this.allTickets.update(tickets =>
        tickets.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t)
      );
    }
    this.currentDraggedTicket.set(null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Must be called to allow drop
  }

  // --- Modal Logic ---
  openTicketDetails(ticket: Ticket) {
    // Create a copy so cancel works
    this.selectedTicket.set({ ...ticket });
    this.displayTicketDialog.set(true);
  }

  updateSelectedTicket(field: keyof Ticket, value: any) {
    const current = this.selectedTicket();
    if (current) {
      this.selectedTicket.set({ ...current, [field]: value });
    }
  }

  saveTicketDetails() {
    const updated = this.selectedTicket();
    if (updated) {
      this.allTickets.update(tickets =>
        tickets.map(t => t.id === updated.id ? updated : t)
      );
      this.closeTicketDetails();
    }
  }

  closeTicketDetails() {
    this.displayTicketDialog.set(false);
    this.selectedTicket.set(null);
  }
}
