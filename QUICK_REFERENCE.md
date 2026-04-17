# SIPNG Quick Reference Guide

**For Frontend Developers & Backend Integration**

---

## Services Overview

### AppStateService - All Data Lives Here
**Location:** `src/app/services/app-state.service.ts`

```typescript
// SIGNALS (Mutable State)
currentUser: WritableSignal<User>           // Logged-in user
systemUsers: WritableSignal<User[]>         // All users in system
allTickets: WritableSignal<Ticket[]>        // All tickets across groups
isAuthenticated: WritableSignal<boolean>    // Auth state
selectedGroup: WritableSignal<Group | null> // Currently selected group
selectedTicketId: WritableSignal<string | null> // Open ticket in modal

// COMPUTED (Derived, Auto-Recalculating)
groupTickets = computed(() => ...)          // Tickets in selected group
selectedTicket = computed(() => ...)        // Currently opened ticket
groupMembers = computed(() => ...)          // Users in selected group
myGroups = computed(() => ...)              // User's groups
myAllAssignedTickets = computed(() => ...)  // All assigned to me
myPendingCount = computed(() => ...)        // My pending tickets count
myInProgressCount = computed(() => ...)     // My in-progress tickets count
myDoneCount = computed(() => ...)           // My completed tickets count
myReviewCount = computed(() => ...)         // My review tickets count
```

---

## Data Models Quick Reference

### User
```typescript
{
  id: 'U-0',
  name: 'Jesus Efrain Bocanegra Mata',
  email: 'jesusefrainbocanegramata@gmail.com',
  role: 'Superadmin' | 'Admin' | 'Dev' | 'Usuario',
  avatarUrl: 'https://i.pravatar.cc/150?img=67',
  permissions: ['ticket:create', 'ticket:edit', ...], // Global permissions
  permissionsByGroup: {
    '1': ['ticket:create'], // Group-specific permissions
  },
  groups: ['1', '2', '3'], // IDs of groups user belongs to
  age: 30,
  phone: '1234567890'
}
```

### Group
```typescript
{
  id: '1',
  name: 'Equipo Dev',
  description: 'Equipo de desarrollo de software',
  color: '#6366f1',        // Hex color for UI
  icon: 'pi-code'          // PrimeIcon class
}
```

### Ticket
```typescript
{
  id: 'T-01',
  title: 'Corregir bug de login',
  description: 'El usuario no puede pasar...',
  status: 'Pendiente' | 'En Progreso' | 'Revisión' | 'Hecho' | 'Bloqueado',
  creator: 'dev1@ejemplo.com',
  assignedTo: 'usuario@demo.com',
  groupId: '1',
  priority: 'Baja' | 'Media' | 'Alta',
  dueDate: new Date(2026, 3, 10),
  createdAt: new Date(2026, 3, 1),
  comments: [
    {
      author: 'user@email.com',
      text: 'Comment text here',
      date: new Date()
    }
  ],
  history: [
    {
      author: 'user@email.com',
      action: 'Cambió status de "Pendiente" a "En Progreso"',
      date: new Date()
    }
  ]
}
```

---

## Mock Data Location

```typescript
// src/app/services/app-state.service.ts

// Users (4 mock users)
currentUser = signal<User>({...})
systemUsers = signal<User[]>([...])

// Groups (3 mock groups)
groups: Group[] = [
  { id: '1', name: 'Equipo Dev', ... },
  { id: '2', name: 'Soporte', ... },
  { id: '3', name: 'UX & Diseño', ... }
]

// Tickets (5 mock tickets)
allTickets = signal<Ticket[]>([...])
```

---

## Permission System

### All Available Permissions (22 total)

**Tickets (7):**
- `ticket:create` - Create new tickets
- `ticket:edit` - Edit ticket details
- `ticket:delete` - Delete tickets
- `ticket:view` - View ticket details
- `ticket:assign` - Assign tickets to users
- `ticket:change_status` - Update ticket status
- `ticket:comment` - Add comments to tickets

**Groups (6):**
- `group:create` - Create groups
- `group:edit` - Edit group config
- `group:delete` - Delete groups
- `group:view` - View groups
- `group:add_member` - Add users to group
- `group:remove_member` - Remove users from group

**Users (4):**
- `user:create` - Create users
- `user:edit` - Edit user details
- `user:delete` - Delete users
- `user:view` - View user profiles
- `user:manage_permissions` - Manage user permissions

### Permission Resolution Order
```
1. Check group-specific permissions in currentUser.permissionsByGroup[groupId]
2. Fall back to global permissions in currentUser.permissions
```

### Usage in Templates
```typescript
@if (state.hasPermission('ticket:create')) {
  <p-button label="Nuevo" icon="pi pi-plus"></p-button>
}

@if (state.hasPermission('group:edit')) {
  <p-button label="Guardar configuración"></p-button>
}
```

---

## Component Routes & Mapping

| Route | Component | File |
|-------|-----------|------|
| `/auth/login` | LoginComponent | `pages/auth/login/login.component.ts` |
| `/home` | GroupSelectionComponent | `pages/home/group-selection/group-selection.component.ts` |
| `/user/profile` | ProfileComponent | `pages/user/profile/profile.component.ts` |
| `/groups/dashboard` | DashboardComponent | `pages/groups/dashboard/dashboard.component.ts` |
| `/groups/settings` | SettingsComponent | `pages/groups/settings/settings.component.ts` |
| `/tickets/kanban` | KanbanComponent | `pages/tickets/kanban/kanban.component.ts` |
| `/tickets/list` | ListComponent | `pages/tickets/list/list.component.ts` |
| `/tickets/detail/:id` | TicketDetailComponent | `pages/tickets/detail/ticket-detail.component.ts` |
| `/admin/user-settings` | UserSettingsComponent | `pages/admin/user-settings/user-settings.component.ts` |

---

## Key Methods in AppStateService

### Authentication
```typescript
login(): void                          // Mock login using email/password signals
register(userData, password): boolean  // Register new user (mock)
logout(): void                         // Clear auth state
```

### Group Management
```typescript
selectGroup(group: Group): void        // Set selected group context
clearGroup(): void                     // Clear group selection
myGroups: computed(() => ...)          // Get user's groups
```

### Ticket Operations
```typescript
updateTicket(id: string, updates: Partial<Ticket>): void
addComment(ticketId: string, text: string): void
groupTickets: computed(() => ...)      // Get tickets in selected group
```

### Permission Checking
```typescript
hasPermission(perm: Permission | string): boolean
getUserPermissionsInGroup(userId: string, groupId: string): Permission[]
setUserPermissionsInGroup(userId: string, groupId: string, permissions: Permission[]): void
getUserGroupPermissions(userId: string): { [groupId: string]: Permission[] }
```

---

## Common Usage Patterns

### Read User Info
```typescript
state.currentUser()           // Get current logged-in user
state.currentUser().email     // User email
state.currentUser().role      // User role
state.currentUser().permissions // User's global permissions
```

### Read Group Context
```typescript
state.selectedGroup()         // Get selected group
state.selectedGroup()?.name   // Group name
state.groupMembers()          // Users in selected group
state.groupTickets()          // Tickets in selected group
```

### Read Ticket Info
```typescript
state.selectedTicket()        // Get opened ticket (computed)
state.allTickets()            // All tickets
state.myAllAssignedTickets()  // My tickets
```

### Check Permissions
```typescript
state.hasPermission('ticket:create')      // In component.ts
@if (state.hasPermission('ticket:create')) { } // In template

// Multiple permissions
state.hasPermission('group:edit') && state.hasPermission('group:delete')
```

### Update State
```typescript
state.updateTicket('T-01', { status: 'En Progreso', priority: 'Alta' })
state.addComment('T-01', 'This is a comment')
state.selectGroup(groupObject)
```

---

## Frontend State Management Flow

```
Component reads signal/computed
       ↓
Signal/Computed auto-updates
       ↓
Component re-renders
       ↓
User interacts
       ↓
Component calls AppStateService method
       ↓
Signal is updated
       ↓
Loop repeats (reactive)
```

---

## Mock Login Test Users

```
1. jesusefrainbocanegramata@gmail.com (Superadmin)
2. diegotristanlimon@gmail.com (Admin)
3. luismontesvelazquez@gmail.com (Usuario)
4. paulavaleriasancheztrejo@gmail.com (Dev)

Password: Any value (mock doesn't validate)
```

---

## Filtering Patterns Used

### List Component Filters
```typescript
activeFilter = signal<'mis_tickets' | 'sin_asignar' | 'alta_prioridad' | null>(null)

// Applied in sortedTickets computed:
if (filter === 'mis_tickets') {
  tickets = tickets.filter(t => t.assignedTo === state.email())
} else if (filter === 'sin_asignar') {
  tickets = tickets.filter(t => !t.assignedTo || t.assignedTo === 'Sin asignar')
} else if (filter === 'alta_prioridad') {
  tickets = tickets.filter(t => t.priority === 'Alta')
}
```

### Sorting Patterns
```typescript
sortField = signal<keyof Ticket>('createdAt')
sortAscending = signal<boolean>(false)

// Sort implementation
tickets.sort((a, b) => {
  let valA = a[sortField()]
  let valB = b[sortField()]
  if (valA < valB) return sortAscending() ? -1 : 1
  if (valA > valB) return sortAscending() ? 1 : -1
  return 0
})
```

---

## Component Interaction Matrix

| Initiator | Action | Target | Method |
|-----------|--------|--------|--------|
| LoginComponent | User submits | AppStateService | `login()` / `register()` |
| GroupSelectionComponent | User selects group | AppStateService | `selectGroup()` |
| DashboardComponent | User clicks ticket | AppStateService | `selectedTicketId.set()` |
| ListComponent | User toggles filter | ListComponent | `toggleFilter()` |
| KanbanComponent | User drags ticket | AppStateService | `updateTicket()` |
| TicketDetailComponent | User saves changes | AppStateService | `updateTicket()` |
| TicketDetailComponent | User comments | AppStateService | `addComment()` |
| SettingsComponent | User removes member | AppStateService | `systemUsers.update()` |

---

## Important Signals to Watch

```typescript
// Primary triggers
state.isAuthenticated()     // Login/logout state
state.selectedGroup()       // Group context changes
state.selectedTicketId()    // Modal visibility trigger

// These auto-recalculate when above change:
state.groupTickets()        // When selectedGroup changes
state.selectedTicket()      // When selectedTicketId changes
state.groupMembers()        // When selectedGroup changes
state.myGroups()            // When currentUser changes
```

---

## UI Component Dependencies

```
PrimeNG Components Used:
- p-button         ✓
- p-card           ✓
- p-dialog         ✓
- p-input-text     ✓
- p-password       ✓
- p-select         ✓
- p-textarea       ✓
- p-tabs           ✓
- p-checkbox       ✓
- p-divider        ✓
- p-tag            ✓
```

---

## Performance Considerations

### Computed Signals (Efficient)
```typescript
groupTickets = computed(() => {
  const group = this.selectedGroup()
  if (!group) return []
  return this.allTickets().filter(t => t.groupId === group.id)
})
// Only recalculates when selectedGroup OR allTickets change
```

### Manual Filtering (In Components)
```typescript
sortedTickets() {
  return () => {
    let tickets = [...this.state.groupTickets()]  // Create copy
    // Apply filters and sorting
    return tickets
  }
}
// Recalculates on every access (OK for computed)
```

---

## Next Steps for Backend Integration

1. **Create `api.service.ts`**
   - Replace mock methods with HTTP calls
   - Inject HttpClient
   - Handle JWT tokens

2. **Update AppStateService**
   - Call API instead of mock data
   - Keep signal-based architecture
   - Add loading states

3. **Add HttpClient provider**
   - In `app.config.ts`
   - Add interceptor for auth headers

4. **Error handling**
   - Add error signals
   - Show toast notifications
   - Handle 401/403 responses

5. **Loading states**
   - Add `isLoading` signals
   - Show spinners in templates

---

**For more details, see: [FRONTEND_ANALYSIS.md](./FRONTEND_ANALYSIS.md)**
