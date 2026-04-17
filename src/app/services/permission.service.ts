import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export const ALL_PERMISSIONS = [
  // Tickets
  'ticket:create', 'ticket:edit', 'ticket:delete', 'ticket:view',
  'ticket:assign', 'ticket:change_status', 'ticket:comment',
  // Grupos
  'group:create', 'group:edit', 'group:delete', 'group:view', 'group:add_member', 'group:remove_member',
  // Usuarios
  'user:create', 'user:edit', 'user:delete', 'user:view', 'user:manage_permissions'
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userPermissionsByGroup = signal<{ [groupId: string]: Permission[] }>({});
  private currentGroupId = signal<string | null>(null);

  constructor() {
    // Inicializar con permisos vacíos
  }

  /**
   * Verifica si el usuario tiene un permiso específico en el grupo actual
   */
  hasPermission(permission: Permission | string): boolean {
    const groupId = this.currentGroupId();
    if (!groupId) return false;

    const permissions = this.userPermissionsByGroup()[groupId] || [];
    return permissions.includes(permission as Permission);
  }

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  hasAnyPermission(permissions: (Permission | string)[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  hasAllPermissions(permissions: (Permission | string)[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Obtiene todos los permisos del usuario en el grupo actual
   */
  getGroupPermissions(groupId: string): Permission[] {
    return this.userPermissionsByGroup()[groupId] || [];
  }

  /**
   * Establece los permisos para el grupo actual
   */
  setPermissionsForGroup(groupId: string, permissions: Permission[]): void {
    const current = this.userPermissionsByGroup();
    this.userPermissionsByGroup.set({
      ...current,
      [groupId]: permissions
    });
  }

  /**
   * Refresca los permisos para un grupo específico
   */
  refreshPermissionsForGroup(groupId: string): void {
    // Aquí se llamaría a la API para traer los permisos más recientes
    // Por ahora es un placeholder
  }

  /**
   * Establece el grupo actual para evaluación de permisos
   */
  setCurrentGroup(groupId: string): void {
    this.currentGroupId.set(groupId);
  }

  /**
   * Obtiene todos los permisos disponibles en el sistema
   */
  getAllPermissions(): readonly Permission[] {
    return ALL_PERMISSIONS;
  }

  /**
   * Obtiene los permisos agrupados por categoría
   */
  getPermissionsByCategory() {
    return {
      tickets: ALL_PERMISSIONS.filter(p => p.startsWith('ticket:')),
      groups: ALL_PERMISSIONS.filter(p => p.startsWith('group:')),
      users: ALL_PERMISSIONS.filter(p => p.startsWith('user:'))
    };
  }
}
