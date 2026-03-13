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
