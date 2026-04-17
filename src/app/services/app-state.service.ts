import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Permission, ALL_PERMISSIONS } from './permission.service';

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
  permissions: Permission[]; // Permisos globales del usuario
  permissionsByGroup?: { [groupId: string]: Permission[] }; // Permisos específicos por grupo
  groups: string[];
  age?: number;
  phone?: string;
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
    avatarUrl: 'https://i.pravatar.cc/150?img=67',
    permissions: [...ALL_PERMISSIONS],
    groups: ['1', '2', '3']
  });

  // --- SYSTEM DATA (MOCKS) ---
  systemUsers: WritableSignal<User[]> = signal([
    this.currentUser(),
    { id: 'U-1', name: 'Diego Tristan Limon', email: 'diegotristanlimon@gmail.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin', permissions: ['ticket:create', 'ticket:edit', 'ticket:delete', 'ticket:view', 'ticket:assign', 'ticket:change_status', 'ticket:comment', 'group:view', 'user:create', 'user:edit', 'user:view'], groups: ['1', '3'] },
    { id: 'U-2', name: 'Luis Felipe Montes Velazquez', email: 'luismontesvelazquez@gmail.com', role: 'Usuario', avatarUrl: 'https://i.pravatar.cc/150?u=user', permissions: ['ticket:view', 'ticket:comment', 'group:view'], groups: ['1', '2'] },
    { id: 'U-3', name: 'Paula Valeria Sanchez Trejo', email: 'paulavaleriasancheztrejo@gmail.com', role: 'Dev', avatarUrl: 'https://i.pravatar.cc/150?u=dev', permissions: ['ticket:create', 'ticket:edit', 'ticket:view', 'ticket:change_status', 'ticket:comment', 'group:view'], groups: ['1', '3'] },
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
  selectedTicketId: WritableSignal<string | null> = signal(null);

  // --- DERIVED COMPUTED STATE ---
  groupTickets = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.allTickets().filter(t => t.groupId === group.id);
  });

  selectedTicket = computed(() => {
    const id = this.selectedTicketId();
    if (!id) return null;
    return this.allTickets().find(t => t.id === id) || null;
  });

  groupMembers = computed(() => {
    const group = this.selectedGroup();
    if (!group) return [];
    return this.systemUsers().filter(u => u.groups.includes(group.id));
  });

  myGroups = computed(() => {
    const userGroups = this.currentUser().groups || [];
    return this.groups.filter(g => userGroups.includes(g.id));
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
      // Find the user by email
      const foundUser = this.systemUsers().find(u => u.email.toLowerCase() === this.email().toLowerCase());

      if (foundUser) {
        this.currentUser.set(foundUser);
        this.isAuthenticated.set(true);
      } else {
        alert('Cuenta no encontrada. Por favor ingresa uno de los correos de prueba.');
      }
    }
  }

  register(userData: Partial<User>, password?: string) {
    const newUser: User = {
      id: 'U-' + Math.floor(Math.random() * 100000),
      name: userData.name || '',
      email: userData.email || '',
      role: 'Usuario',
      avatarUrl: 'https://i.pravatar.cc/150?u=' + (userData.email || 'new'),
      permissions: ['ticket:view', 'ticket:comment', 'group:view'], // Basic permissions by default
      groups: [],
      age: userData.age,
      phone: userData.phone
    };

    // Check if email already exists
    if (this.systemUsers().find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return false; // Registration failed: Email exists
    }

    this.systemUsers.update(users => [...users, newUser]);
    // Optionally automatically log them in:
    this.email.set(newUser.email);
    this.password.set(password || '');
    this.currentUser.set(newUser);
    this.isAuthenticated.set(true);
    return true; // Registration successful
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

  hasPermission(perm: Permission | string): boolean {
    // Si hay un grupo seleccionado, verificar permisos específicos del grupo
    const selectedGroup = this.selectedGroup();
    if (selectedGroup) {
      const groupPermissions = this.currentUser().permissionsByGroup?.[selectedGroup.id] || [];
      if (groupPermissions.includes(perm as Permission)) {
        return true;
      }
    }
    
    // Fallback a permisos globales
    return this.currentUser().permissions.includes(perm as Permission);
  }

  /**
   * Obtiene los permisos de un usuario en un grupo específico
   */
  getUserPermissionsInGroup(userId: string, groupId: string): Permission[] {
    const user = this.systemUsers().find(u => u.id === userId);
    if (!user) return [];
    
    // Retornar permisos específicos del grupo si existen
    return user.permissionsByGroup?.[groupId] || user.permissions;
  }

  /**
   * Asigna permisos a un usuario en un grupo específico
   */
  setUserPermissionsInGroup(userId: string, groupId: string, permissions: Permission[]): void {
    this.systemUsers.update(users => users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissionsByGroup: {
            ...u.permissionsByGroup,
            [groupId]: permissions
          }
        };
      }
      return u;
    }));

    // Si es el usuario actual, actualizar también currentUser
    if (this.currentUser().id === userId) {
      this.currentUser.update(user => ({
        ...user,
        permissionsByGroup: {
          ...user.permissionsByGroup,
          [groupId]: permissions
        }
      }));
    }
  }

  /**
   * Obtiene todos los permisos de un usuario en todos los grupos
   */
  getUserGroupPermissions(userId: string): { [groupId: string]: Permission[] } {
    const user = this.systemUsers().find(u => u.id === userId);
    if (!user) return {};
    
    return user.permissionsByGroup || {};
  }

  updateTicket(id: string, updates: Partial<Ticket>) {
    this.allTickets.update(tickets => tickets.map(t => {
      if (t.id === id) {
        const historyEntries: TicketHistory[] = [];
        Object.keys(updates).forEach(key => {
          if (updates[key] !== (t as any)[key] && key !== 'comments' && key !== 'history') {
            historyEntries.push({
              author: this.currentUser().email,
              action: `Cambió ${key} de "${(t as any)[key]}" a "${updates[key]}"`,
              date: new Date()
            });
          }
        });

        return {
          ...t,
          ...updates,
          history: [...t.history, ...historyEntries]
        };
      }
      return t;
    }));
  }

  addComment(ticketId: string, text: string) {
    if (!text.trim()) return;
    this.allTickets.update(tickets => tickets.map(t => {
      if (t.id === ticketId) {
        const newComment: TicketComment = {
          author: this.currentUser().email,
          text: text,
          date: new Date()
        };
        return {
          ...t,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    }));
  }

}
