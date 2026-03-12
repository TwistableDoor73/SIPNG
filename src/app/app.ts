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
  icon: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export type TicketStatus = 'Pendiente' | 'En Progreso' | 'Revisión' | 'Hecho';
export type TicketPriority = 'Baja' | 'Media' | 'Alta';

export interface TicketComment {
  author: string;
  text: string;
  date: Date;
}

export interface TicketHistory {
  author: string;
  action: string;
  date: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  creator: string;
  assignedTo: string;
  groupId: string;
  priority: TicketPriority;
  dueDate: Date;
  createdAt: Date;
  comments: TicketComment[];
  history: TicketHistory[];
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

  currentUser = signal<User>({
    name: 'Jesús Bocanegra',
    email: 'usuario@ejemplo.com',
    role: 'Desarrollador Senior',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
  });

  showProfile = signal(false);

  // Permission system (Mock: assigned to the logged in user)
  userPermissions = signal<string[]>(['create_ticket', 'view_kanban']);

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  groups: Group[] = [
    { id: '1', name: 'Equipo Dev', description: 'Desarrollo, análisis de código y arquitectura.', color: '#0ea5e9', icon: 'pi-code' },
    { id: '2', name: 'Soporte', description: 'Sistema de atención y resolución de dudas.', color: '#10b981', icon: 'pi-headphones' },
    { id: '3', name: 'UX & Diseño', description: 'Diseño de interfaces e ideación.', color: '#ec4899', icon: 'pi-palette' }
  ];

  allTickets: WritableSignal<Ticket[]> = signal([
    { id: 'T-01', title: 'Corregir bug de login', description: 'El usuario no puede pasar de la pantalla de inicio si su password tiene caracteres especiales.', status: 'En Progreso', creator: 'dev1@ejemplo.com', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Media', dueDate: new Date(2026, 3, 10), createdAt: new Date(2026, 3, 1), comments: [], history: [] },
    { id: 'T-02', title: 'Actualizar dependencias', description: 'Subir versión de Node y Angular.', status: 'Hecho', creator: 'admin@ejemplo.com', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Baja', dueDate: new Date(2026, 3, 5), createdAt: new Date(2026, 2, 28), comments: [], history: [] },
    { id: 'T-03', title: 'Implementar oAuth', description: 'Integrar login con Google Workspace.', status: 'Pendiente', creator: 'admin@ejemplo.com', assignedTo: 'dev2@ejemplo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 15), createdAt: new Date(2026, 3, 2), comments: [], history: [] },
    { id: 'T-04', title: 'Error en despliegue', description: 'Pipeline fallando en la etapa de build.', status: 'Revisión', creator: 'usuario@ejemplo.com', assignedTo: 'usuario@ejemplo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 12), createdAt: new Date(2026, 3, 5), comments: [], history: [] },
    { id: 'T-05', title: 'Revisar tickets atrasados', description: 'Hacer una limpieza de los tickets sin atención.', status: 'Pendiente', creator: 'manager@ejemplo.com', assignedTo: 'soporte1@ejemplo.com', groupId: '2', priority: 'Media', dueDate: new Date(2026, 3, 20), createdAt: new Date(2026, 3, 10), comments: [], history: [] }
  ]);

  // Drag and Drop state
  currentDraggedTicket = signal<Ticket | null>(null);

  // Modal State
  displayTicketDialog = signal(false);
  selectedTicket = signal<Ticket | null>(null);
  newCommentText = signal('');

  // Options for dropdowns
  statusOptions = ['Pendiente', 'En Progreso', 'Revisión', 'Hecho'];
  priorityOptions = ['Baja', 'Media', 'Alta'];

  // Computed signals for the selected group's tickets
  groupTickets = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.allTickets().filter(t => t.groupId === group.id);
  });

  // --- List View State ---
  currentView = signal<'kanban' | 'list'>('kanban');
  filterStatus = signal<string>('');
  filterPriority = signal<string>('');
  filterAssignee = signal<string>('');
  sortField = signal<keyof Ticket>('createdAt');
  sortAscending = signal<boolean>(false);

  filteredGroupTickets = computed(() => {
    let tickets = [...this.groupTickets()];

    // Filtering
    const status = this.filterStatus();
    if (status) tickets = tickets.filter(t => t.status === status);

    const priority = this.filterPriority();
    if (priority) tickets = tickets.filter(t => t.priority === priority);

    const assignee = this.filterAssignee();
    if (assignee) tickets = tickets.filter(t => t.assignedTo.toLowerCase().includes(assignee.toLowerCase()));

    // Sorting
    const field = this.sortField();
    const isAsc = this.sortAscending();

    tickets.sort((a: any, b: any) => {
      let valA = a[field];
      let valB = b[field];

      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    return tickets;
  });

  toggleSort(field: keyof Ticket) {
    if (this.sortField() === field) {
      this.sortAscending.set(!this.sortAscending());
    } else {
      this.sortField.set(field);
      this.sortAscending.set(true);
    }
  }

  pendingTickets = computed(() => this.groupTickets().filter(t => t.status === 'Pendiente'));
  inProgressTickets = computed(() => this.groupTickets().filter(t => t.status === 'En Progreso'));
  reviewTickets = computed(() => this.groupTickets().filter(t => t.status === 'Revisión'));
  doneTickets = computed(() => this.groupTickets().filter(t => t.status === 'Hecho'));

  // Mini-list for user
  myRecentTickets = computed(() => {
    return this.groupTickets().filter(t => t.assignedTo === this.email()).slice(0, 3);
  });

  // --- Profile View Workload Statistics ---
  myAllAssignedTickets = computed(() => {
    // Tickets from ALL groups assigned to this user
    return this.allTickets().filter(t => t.assignedTo === this.email());
  });

  myPendingCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Pendiente').length);
  myInProgressCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'En Progreso').length);
  myDoneCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Hecho').length);
  myReviewCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Revisión').length);

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
    this.showProfile.set(false); // Ensure profile is closed when jumping to a group
  }

  backToGroups() {
    this.selectedGroup.set(null);
    this.showProfile.set(false);
  }

  toggleProfile() {
    // If we're showing the profile, we don't clear selectedGroup so we know where to go back
    this.showProfile.set(!this.showProfile());
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
        tickets.map(t => {
          if (t.id === ticket.id) {
            const updatedTicket = { ...t, status: newStatus };
            updatedTicket.history = [...updatedTicket.history, {
              author: this.email(),
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

  canEditFullTicket(ticket: Ticket | null): boolean {
    return ticket !== null && ticket.creator === this.email();
  }

  canEditStatus(ticket: Ticket | null): boolean {
    return ticket !== null && (ticket.creator === this.email() || ticket.assignedTo === this.email());
  }

  saveTicketDetails() {
    const updated = this.selectedTicket();
    if (updated) {
      this.allTickets.update(tickets =>
        tickets.map(t => {
          if (t.id === updated.id) {
            // Document basic changes in history if needed 
            // Here we assume changes happen and rely on the full save
            // A perfect system would diff each property, we'll keep it simple
            const changedObj = { ...updated };
            if (t.status !== updated.status) {
              changedObj.history = [...changedObj.history, { author: this.email(), action: `Cambió el estado a ${updated.status}`, date: new Date() }];
            }
            if (t.priority !== updated.priority) {
              changedObj.history = [...changedObj.history, { author: this.email(), action: `Cambió la prioridad a ${updated.priority}`, date: new Date() }];
            }
            if (t.assignedTo !== updated.assignedTo) {
              changedObj.history = [...changedObj.history, { author: this.email(), action: `Asignó el ticket a ${updated.assignedTo}`, date: new Date() }];
            }
            return changedObj;
          }
          return t;
        })
      );
      this.closeTicketDetails();
    }
  }

  addComment() {
    const text = this.newCommentText().trim();
    const currentTkt = this.selectedTicket();
    if (text && currentTkt) {
      const newComment = {
        author: this.email(),
        text: text,
        date: new Date()
      };
      // Optimistically update dialog state
      this.selectedTicket.set({
        ...currentTkt,
        comments: [...currentTkt.comments, newComment]
      });
      // Clear input
      this.newCommentText.set('');
    }
  }

  closeTicketDetails() {
    this.displayTicketDialog.set(false);
    this.selectedTicket.set(null);
  }
}
