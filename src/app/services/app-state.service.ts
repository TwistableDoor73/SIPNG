import { Injectable, signal, computed, WritableSignal } from '@angular/core';

// --- MODELS ---
export interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  permissions: number;
  groups: string[];
}

export type TicketStatus = 'Pendiente' | 'En Progreso' | 'Revisión' | 'Hecho' | 'Bloqueado';
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
  [key: string]: any; // Allow dynamic access for sorting keys
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  // --- AUTH STATE ---
  isAuthenticated: WritableSignal<boolean> = signal(false);
  email: WritableSignal<string> = signal('jesusefrainbocanegramata@gmail.com');
  password: WritableSignal<string> = signal('password123');

  currentUser: WritableSignal<User> = signal<User>({
    id: 'U-0',
    name: 'Jesus Efrain Bocanegra Mata',
    email: 'jesusefrainbocanegramata@gmail.com',
    role: 'Superadmin',
    avatarUrl: 'https://i.pravatar.cc/150?u=superadmin',
    permissions: 18,
    groups: ['1', '2', '3']
  });

  // --- SYSTEM DATA (MOCKS) ---
  systemUsers: WritableSignal<User[]> = signal([
    this.currentUser(),
    { id: 'U-1', name: 'Diego Tristan Limon', email: 'diegotristanlimon@gmail.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin', permissions: 14, groups: ['1', '3'] },
    { id: 'U-2', name: 'Luis Felipe Montes Velazquez', email: 'luismontesvelazquez@gmail.com', role: 'Usuario', avatarUrl: 'https://i.pravatar.cc/150?u=user', permissions: 6, groups: ['1', '2'] },
    { id: 'U-3', name: 'Paula Valeria Sanchez Trejo', email: 'paulavaleriasancheztrejo@gmail.com', role: 'Dev', avatarUrl: 'https://i.pravatar.cc/150?u=dev', permissions: 8, groups: ['1', '3'] },
  ]);

  groups: Group[] = [
    { id: '1', name: 'Equipo Dev', description: 'Equipo de desarrollo de software', color: '#6366f1', icon: 'pi-code' },
    { id: '2', name: 'Soporte', description: 'Sistema de atención y resolución de dudas.', color: '#10b981', icon: 'pi-headphones' },
    { id: '3', name: 'UX & Diseño', description: 'Diseño de interfaces e ideación.', color: '#ec4899', icon: 'pi-palette' }
  ];

  allTickets: WritableSignal<Ticket[]> = signal([
    { id: 'T-01', title: 'Corregir bug de login', description: 'El usuario no puede pasar de la pantalla de inicio si su password tiene caracteres especiales.', status: 'En Progreso', creator: 'dev1@ejemplo.com', assignedTo: 'usuario@demo.com', groupId: '1', priority: 'Media', dueDate: new Date(2026, 3, 10), createdAt: new Date(2026, 3, 1), comments: [], history: [] },
    { id: 'T-02', title: 'Actualizar dependencias', description: 'Subir versión de Node y Angular.', status: 'Hecho', creator: 'admin@demo.com', assignedTo: 'usuario@demo.com', groupId: '1', priority: 'Baja', dueDate: new Date(2026, 3, 5), createdAt: new Date(2026, 2, 28), comments: [], history: [] },
    { id: 'T-03', title: 'Implementar oAuth', description: 'Integrar login con Google Workspace.', status: 'Pendiente', creator: 'admin@demo.com', assignedTo: 'dev@demo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 15), createdAt: new Date(2026, 3, 2), comments: [], history: [] },
    { id: 'T-04', title: 'Error en despliegue', description: 'Pipeline fallando en la etapa de build.', status: 'Revisión', creator: 'usuario@demo.com', assignedTo: 'usuario@demo.com', groupId: '1', priority: 'Alta', dueDate: new Date(2026, 3, 12), createdAt: new Date(2026, 3, 5), comments: [], history: [] },
    { id: 'T-05', title: 'Revisar tickets atrasados', description: 'Hacer una limpieza de los tickets sin atención.', status: 'Pendiente', creator: 'manager@ejemplo.com', assignedTo: 'soporte1@ejemplo.com', groupId: '2', priority: 'Media', dueDate: new Date(2026, 3, 20), createdAt: new Date(2026, 3, 10), comments: [], history: [] }
  ]);


  // --- NAVIGATION STATE ---
  selectedGroup: WritableSignal<Group | null> = signal(null);

  // --- DERIVED COMPUTED STATE ---
  groupTickets = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.allTickets().filter(t => t.groupId === group.id);
  });

  groupMembers = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.systemUsers().filter(u => u.groups.includes(group.id));
  });

  myAllAssignedTickets = computed(() => {
    return this.allTickets().filter(t => t.assignedTo === this.currentUser().email);
  });

  myPendingCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Pendiente').length);
  myInProgressCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'En Progreso').length);
  myDoneCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Hecho').length);
  myReviewCount = computed(() => this.myAllAssignedTickets().filter(t => t.status === 'Revisión').length);

  // --- ACTIONS ---
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

  clearGroup() {
    this.selectedGroup.set(null);
  }

}
