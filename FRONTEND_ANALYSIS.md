# SIPNG Frontend Architecture & Data Flow Analysis

**Date:** April 17, 2026  
**Project:** SIPNG - ERP Ticket Management System  
**Frontend Framework:** Angular 20.3.0 (Standalone Components)  
**UI Library:** PrimeNG 20.4.0 + PrimeIcons  

---

## 1. SERVICES WITH MOCK DATA

### 1.1 AppStateService (`src/app/services/app-state.service.ts`)
**Type:** Injectable (Singleton)  
**Status:** Contains complete mock data system

#### Mock Data Collections:

**A. Authentication & Users**
```typescript
isAuthenticated: WritableSignal<boolean> = signal(false)
email: WritableSignal<string> = signal('jesusefrainbocanegramata@gmail.com')
password: WritableSignal<string> = signal('password123')

currentUser: WritableSignal<User> = signal({
  id: 'U-0',
  name: 'Jesus Efrain Bocanegra Mata',
  email: 'jesusefrainbocanegramata@gmail.com',
  role: 'Superadmin',
  avatarUrl: 'https://i.pravatar.cc/150?img=67',
  permissions: [...ALL_PERMISSIONS], // All 22 permissions
  groups: ['1', '2', '3']
})

systemUsers: WritableSignal<User[]> = signal([
  // 4 mock users:
  // - U-0: Jesus (Superadmin, all groups)
  // - U-1: Diego (Admin, groups 1,3)
  // - U-2: Luis Felipe (Usuario, groups 1,2)
  // - U-3: Paula (Dev, groups 1,3)
])
```

**B. Groups/Workspaces**
```typescript
groups: Group[] = [
  {
    id: '1',
    name: 'Equipo Dev',
    description: 'Equipo de desarrollo de software',
    color: '#6366f1',
    icon: 'pi-code'
  },
  {
    id: '2',
    name: 'Soporte',
    description: 'Sistema de atención y resolución de dudas.',
    color: '#10b981',
    icon: 'pi-headphones'
  },
  {
    id: '3',
    name: 'UX & Diseño',
    description: 'Diseño de interfaces e ideación.',
    color: '#ec4899',
    icon: 'pi-palette'
  }
]
```

**C. Tickets**
```typescript
allTickets: WritableSignal<Ticket[]> = signal([
  // 5 mock tickets:
  // T-01: Bug login (En Progreso, Media priority, group 1)
  // T-02: Update dependencies (Hecho, Baja priority, group 1)
  // T-03: Implement OAuth (Pendiente, Alta priority, group 1)
  // T-04: Deploy error (Revisión, Alta priority, group 1)
  // T-05: Review old tickets (Pendiente, Media priority, group 2)
])
```

#### Navigation State Signals:
```typescript
selectedGroup: WritableSignal<Group | null> = signal(null)
selectedTicketId: WritableSignal<string | null> = signal(null)
```

#### Computed/Derived State:
```typescript
groupTickets = computed(() => filter tickets by selectedGroup)
selectedTicket = computed(() => find ticket by selectedTicketId)
groupMembers = computed(() => filter users by selectedGroup)
myGroups = computed(() => filter groups by currentUser.groups)
myAllAssignedTickets = computed(() => tickets assigned to currentUser)
myPendingCount = computed(() => count pending tickets)
myInProgressCount = computed(() => count in-progress tickets)
myDoneCount = computed(() => count completed tickets)
myReviewCount = computed(() => count review tickets)
```

#### Core Methods:
```typescript
login(): void
register(userData: Partial<User>, password?: string): boolean
logout(): void
selectGroup(group: Group): void
clearGroup(): void
hasPermission(perm: Permission | string): boolean
getUserPermissionsInGroup(userId: string, groupId: string): Permission[]
setUserPermissionsInGroup(userId: string, groupId: string, permissions: Permission[]): void
getUserGroupPermissions(userId: string): { [groupId: string]: Permission[] }
updateTicket(id: string, updates: Partial<Ticket>): void
addComment(ticketId: string, text: string): void
```

### 1.2 PermissionService (`src/app/services/permission.service.ts`)
**Type:** Injectable (Singleton)  
**Status:** Manages permissions (no mock data, state-driven)

#### Permission Constants:
```typescript
ALL_PERMISSIONS = [
  // Tickets (7)
  'ticket:create', 'ticket:edit', 'ticket:delete', 'ticket:view',
  'ticket:assign', 'ticket:change_status', 'ticket:comment',
  
  // Groups (6)
  'group:create', 'group:edit', 'group:delete', 'group:view',
  'group:add_member', 'group:remove_member',
  
  // Users (4)
  'user:create', 'user:edit', 'user:delete', 'user:view', 'user:manage_permissions'
]
```

#### Permission Methods:
```typescript
hasPermission(permission: Permission | string): boolean
hasAnyPermission(permissions: (Permission | string)[]): boolean
hasAllPermissions(permissions: (Permission | string)[]): boolean
getGroupPermissions(groupId: string): Permission[]
setPermissionsForGroup(groupId: string, permissions: Permission[]): void
refreshPermissionsForGroup(groupId: string): void // Placeholder for API call
setCurrentGroup(groupId: string): void
getAllPermissions(): readonly Permission[]
getPermissionsByCategory(): { tickets: Permission[]; groups: Permission[]; users: Permission[] }
```

---

## 2. DATA MODELS & INTERFACES

### 2.1 User Model
```typescript
interface User {
  id: string;                                          // UUID-like
  name: string;
  email: string;
  role: string;                                         // 'Superadmin', 'Admin', 'Dev', 'Usuario'
  avatarUrl: string;                                    // URL to avatar
  permissions: Permission[];                            // Global permissions
  permissionsByGroup?: { [groupId: string]: Permission[] }; // Group-specific perms
  groups: string[];                                     // List of group IDs
  age?: number;
  phone?: string;
}
```

### 2.2 Group Model
```typescript
interface Group {
  id: string;
  name: string;
  description: string;
  color: string;                                        // Hex color for UI
  icon: string;                                         // PrimeIcon class name
}
```

### 2.3 Ticket Model
```typescript
type TicketStatus = 'Pendiente' | 'En Progreso' | 'Revisión' | 'Hecho' | 'Bloqueado'
type TicketPriority = 'Baja' | 'Media' | 'Alta'

interface TicketComment {
  author: string;
  text: string;
  date: Date;
}

interface TicketHistory {
  author: string;
  action: string;
  date: Date;
}

interface Ticket {
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
  [key: string]: any; // Dynamic properties for sorting
}
```

---

## 3. COMPONENT STRUCTURE & DATA FLOW

### 3.1 Authentication Flow

#### LoginComponent
**File:** `src/app/pages/auth/login/login.component.ts`  
**Status:** Fully implemented (login & register modes)

**Data Flow:**
```
User Input (email/password)
    ↓
AppStateService.login() or register()
    ↓
Update: currentUser, isAuthenticated
    ↓
Router.navigate(['/home'])
    ↓
AuthGuard: Check isAuthenticated()
```

**Key Features:**
- Dual mode: Login & Registration
- Form validation (email, 10-digit phone, age validation)
- Automatic login after registration
- Uses AppStateService signals directly

**Mock Login Accounts:**
```
Email: jesusefrainbocanegramata@gmail.com
Email: diegotristanlimon@gmail.com
Email: luismontesvelazquez@gmail.com
Email: paulavaleriasancheztrejo@gmail.com
```

---

### 3.2 Navigation Flow (After Login)

#### MainLayoutComponent
**File:** `src/app/layout/main-layout/main-layout.ts`  
**Status:** Layout container with sidebar navigation

**Layout Structure:**
```
MainLayout
├─ Sidebar Navigation
│  ├─ Dashboard/Home
│  ├─ Profile
│  ├─ Groups (selected group context)
│  ├─ Tickets (Kanban/List)
│  ├─ Admin (if user:manage_permissions)
│  └─ Logout button
└─ Router Outlet (page content)
```

---

### 3.3 Group Selection & Context Flow

#### GroupSelectionComponent
**File:** `src/app/pages/home/group-selection/group-selection.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
AppStateService.myGroups() [computed]
    ↓
Displays clickable group cards
    ↓
User selects group
    ↓
AppStateService.selectGroup(group)
    ↓
Navigate to /groups/dashboard
    ↓
All subsequent pages use selectedGroup context
```

**Displays:**
- List of groups user belongs to: `state.myGroups()`
- Group color, icon, name, description

---

### 3.4 Dashboard/Group Context

#### DashboardComponent
**File:** `src/app/pages/groups/dashboard/dashboard.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
selectedGroup context
    ↓
Display stats:
├─ Pending count: groupTickets().filter(status='Pendiente').length
├─ In Progress count
├─ Review count
├─ Done count
├─ Blocked count (0)
    ↓
Display recent tickets: groupTickets().slice(0, 4)
    ↓
Display my tickets in group: groupTickets().filter(assignedTo=currentUser.email)
```

**Features:**
- Create ticket dialog
- Navigation to Kanban & List views
- Access to group settings (if group:edit permission)

---

### 3.5 Ticket Management Views

#### ListComponent (Ticket List View)
**File:** `src/app/pages/tickets/list/list.component.ts`  
**Status:** Fully implemented

**Data Processing:**
```
1. Get: state.groupTickets() [filtered by selectedGroup]
2. Apply filters:
   - 'mis_tickets': filter(assignedTo = currentUser.email)
   - 'sin_asignar': filter(!assignedTo || assignedTo = 'Sin asignar')
   - 'alta_prioridad': filter(priority = 'Alta')
3. Sort by: id, title, status, priority, assignedTo, dueDate
4. Display in table format
```

**Table Columns:**
- ID (auto-generated as "t1", "t2", etc.)
- Title
- Status (color-coded badge)
- Priority (color-coded: red=Alta, green=Media, yellow=Baja)
- Assigned To (avatar + email)
- Due Date
- Actions (View, Delete if permission)

**Permissions Checked:**
```typescript
state.hasPermission('ticket:create') // Show "Nuevo" button
state.hasPermission('ticket:view')   // Show eye icon
state.hasPermission('ticket:delete') // Show trash icon
```

#### KanbanComponent (Kanban Board)
**File:** `src/app/pages/tickets/kanban/kanban.component.ts`  
**Status:** Fully implemented

**Board Structure:**
```
5 Columns:
├─ Pendiente (#f59e0b - amber)
├─ En Progreso (#3b82f6 - blue)
├─ Revisión (#a855f7 - purple)
├─ Hecho (#10b981 - green)
└─ Bloqueado (#ef4444 - red)
```

**Data Flow:**
```
1. Compute ticketsByStatus: groupTickets().filter(status=columnStatus)
2. Apply same filters as List view
3. Display as draggable cards
4. onDrop: Updates ticket status
```

**Features:**
- Drag & drop tickets between columns
- Same filters as List (mis_tickets, sin_asignar, alta_prioridad)
- Create ticket dialog
- Click to view details

#### TicketDetailComponent (Modal)
**File:** `src/app/pages/tickets/detail/ticket-detail.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
When state.selectedTicketId() changes
    ↓
Compute: state.selectedTicket()
    ↓
Display modal with ticket details
    ↓
Tabs:
├─ Descripción & Metadata (title, description, status, priority)
├─ Comentarios (add/view comments)
└─ Historial (view change history)
```

**Editable Fields (if canEditFull permission):**
- Title
- Description
- Status (always editable if ticket:change_status)
- Priority
- Assigned To

**Features:**
- Comments: Add, View all comments with author & date
- History: Track all changes with author & date
- Save changes button (if changes detected)
- Drag & drop status change
- Assign to self shortcut

---

### 3.6 Group Management

#### SettingsComponent (Group Settings)
**File:** `src/app/pages/groups/settings/settings.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
selectedGroup context
    ↓
Display Config Card:
├─ Group name (disabled)
├─ Description (disabled)
├─ Color preview
└─ Save config button (if group:edit)

Display Members Table:
├─ List: groupMembers() [computed from selectedGroup.id]
├─ Columns: User, Email, Permissions count, Remove action
└─ Add/Remove buttons (if group:add_member / group:remove_member)
```

**Permissions:**
```typescript
state.hasPermission('group:edit')       // Show config save button
state.hasPermission('group:delete')     // Show delete zone
state.hasPermission('group:add_member') // Show add member button
state.hasPermission('group:remove_member') // Show remove icon
```

---

### 3.7 User Management (Admin)

#### ProfileComponent (User Profile)
**File:** `src/app/pages/user/profile/profile.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
currentUser signal
    ↓
Display:
├─ Avatar (from currentUser.avatarUrl)
├─ Name, Email, Role
└─ Stats:
   ├─ Total assigned tickets: myAllAssignedTickets().length
   ├─ Pending: myPendingCount()
   ├─ In Progress: myInProgressCount()
   ├─ Done: myDoneCount()
```

#### UserSettingsComponent (Admin Panel)
**File:** `src/app/pages/admin/user-settings/user-settings.component.ts`  
**Status:** Fully implemented

**Data Flow:**
```
Display Users Table:
├─ Source: state.systemUsers()
├─ Columns: Name, Email, Permissions count, Actions
└─ Actions:
   ├─ Key icon (edit permissions) if user:manage_permissions
   └─ Trash icon (delete) if user:delete

Two Dialogs:
├─ Create User Dialog (if user:create)
│  └─ Input: name, email, role
└─ Permissions Dialog (if user:manage_permissions)
   ├─ Select role
   ├─ Checkbox list of all 22 permissions
   └─ Save permissions
```

---

## 4. EXPECTED API CALL PATTERNS

### 4.1 Current Frontend State
**Status:** Frontend is using local mock data in AppStateService  
**No HTTP calls yet** - All data is in-memory signals

### 4.2 Backend Services Running
**Status:** All backend microservices implemented and ready

**Microservice Ports:**
- API Gateway: `http://localhost:3000`
- User Service: `http://localhost:3001`
- Tickets Service: `http://localhost:3002`
- Groups Service: `http://localhost:3003`

### 4.3 Expected HTTP Endpoints (Need to be called from frontend)

#### Authentication (User Service → via Gateway)
```
POST /auth/login
  Request: { email: string, password: string }
  Response: { token: string, user: User }

POST /auth/register
  Request: { name: string, email: string, password: string, age?: number, phone?: string }
  Response: { token: string, user: User }
```

#### Tickets (Tickets Service → via Gateway)
```
GET /tickets?groupId=1
  Response: Ticket[]

GET /tickets/:id
  Response: Ticket (with comments and history)

POST /tickets
  Request: { title, description, priority, status, assignedToId, dueDate, groupId }
  Response: Ticket

PATCH /tickets/:id
  Request: Partial<Ticket>
  Response: Ticket

DELETE /tickets/:id
  Response: { success: boolean }

POST /tickets/:id/comments
  Request: { text: string }
  Response: TicketComment
```

#### Groups (Groups Service → via Gateway)
```
GET /groups
  Response: Group[]

GET /groups/:id
  Response: Group (with members)

POST /groups
  Request: { name, description, color, icon }
  Response: Group

PATCH /groups/:id
  Request: Partial<Group>
  Response: Group

DELETE /groups/:id
  Response: { success: boolean }

POST /groups/:id/members
  Request: { userId: string }
  Response: GroupMember

DELETE /groups/:id/members/:userId
  Response: { success: boolean }
```

#### Users (User Service → via Gateway)
```
GET /users
  Response: User[]

GET /users/:id
  Response: User

POST /users
  Request: { name, email, role }
  Response: User

PATCH /users/:id
  Request: Partial<User>
  Response: User

DELETE /users/:id
  Response: { success: boolean }

PATCH /users/:id/permissions
  Request: { groupId: string, permissions: Permission[] }
  Response: { success: boolean }
```

---

## 5. COMPONENT DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                      AppStateService                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Signals:                                                 │  │
│  │ - isAuthenticated, currentUser, email, password         │  │
│  │ - systemUsers[], groups[], allTickets[]                 │  │
│  │ - selectedGroup, selectedTicketId                       │  │
│  │                                                           │  │
│  │ Computed:                                                │  │
│  │ - groupTickets, selectedTicket, groupMembers            │  │
│  │ - myGroups, myAllAssignedTickets, my*Count signals     │  │
│  │                                                           │  │
│  │ Methods:                                                 │  │
│  │ - login(), register(), logout()                         │  │
│  │ - selectGroup(), updateTicket(), addComment()           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                ┌─────────────┼─────────────┐
                │             │             │
           ┌────────────┐ ┌────────────┐ ┌─────────────┐
           │   Login    │ │  Dashboard │ │  Kanban/    │
           │ Component  │ │ Component  │ │   List      │
           │            │ │            │ │ Components  │
           └────────────┘ └────────────┘ └─────────────┘
                │             │             │
                │             │             │
           ┌────────────┐ ┌────────────┐ ┌─────────────┐
           │ Router:    │ │  Group     │ │  Ticket     │
           │ /auth/     │ │  Selection │ │  Detail     │
           │ login      │ │ Component  │ │  Modal      │
           │            │ │            │ │             │
           └────────────┘ └────────────┘ └─────────────┘
                │             │             │
                └─────────────┴─────────────┘
                        ↓
             ┌──────────────────────┐
             │  PermissionService   │
             │  & Auth Guards       │
             └──────────────────────┘
```

---

## 6. ROUTING STRUCTURE

```
Routes Tree:
/
├─ /auth/login .......................... LoginComponent (public, loginGuard)
└─ / (authenticated area, authGuard)
   ├─ /home ............................ GroupSelectionComponent
   ├─ /user/profile ................... ProfileComponent
   ├─ /groups/dashboard ............... DashboardComponent
   ├─ /groups/settings ................ SettingsComponent
   ├─ /tickets/kanban ................. KanbanComponent
   ├─ /tickets/list ................... ListComponent
   ├─ /tickets/detail/:id ............. TicketDetailComponent (modal overlay)
   ├─ /admin/user-settings ............ UserSettingsComponent
   └─ ** (catch-all) .................. redirectTo: /home
```

**Guard Implementation:**
- `authGuard`: Checks `isAuthenticated()`, redirects to login if false
- `loginGuard`: Checks `isAuthenticated()`, redirects to home if true (prevents login page access when already logged in)

---

## 7. PERMISSION SYSTEM FLOW

### 7.1 Permission Checking in Components

**Pattern Used:**
```typescript
@if (state.hasPermission('permission:key')) {
  <!-- Render UI element -->
}
```

**Examples:**
```typescript
// Tickets
state.hasPermission('ticket:create')     // Show "New ticket" button
state.hasPermission('ticket:edit')       // Show edit fields
state.hasPermission('ticket:delete')     // Show delete option
state.hasPermission('ticket:view')       // Show view icon
state.hasPermission('ticket:assign')     // Show assignment dropdown
state.hasPermission('ticket:change_status') // Show status selector
state.hasPermission('ticket:comment')    // Show comment form

// Groups
state.hasPermission('group:edit')        // Show config save
state.hasPermission('group:delete')      // Show delete zone
state.hasPermission('group:add_member')  // Show add member button
state.hasPermission('group:remove_member') // Show remove icon

// Users
state.hasPermission('user:create')       // Show create user button
state.hasPermission('user:manage_permissions') // Show permissions dialog
state.hasPermission('user:delete')       // Show delete option
```

### 7.2 Permission Resolution

**Method:** `AppStateService.hasPermission(perm: Permission | string)`

```typescript
hasPermission(perm: Permission | string): boolean {
  const selectedGroup = this.selectedGroup();
  
  // Check group-specific permissions first
  if (selectedGroup) {
    const groupPerms = this.currentUser().permissionsByGroup?.[selectedGroup.id] || [];
    if (groupPerms.includes(perm as Permission)) return true;
  }
  
  // Fall back to global permissions
  return this.currentUser().permissions.includes(perm as Permission);
}
```

---

## 8. KEY IMPLEMENTATION PATTERNS

### 8.1 Using Signals for State
```typescript
// Writing
state.selectedGroup.set(group)
state.allTickets.update(tickets => [...tickets, newTicket])

// Reading in template
{{ state.selectedGroup()?.name }}
{{ state.myAllAssignedTickets().length }}

// Computed values
groupTickets = computed(() => state.groupTickets())
```

### 8.2 Form Binding
```typescript
// Two-way binding with signals
<input [(ngModel)]="state.email()" (ngModelChange)="state.email.set($event)" />

// Local state
<input [(ngModel)]="newTicket().title" />
newTicket = signal<Partial<Ticket>>({ title: '', ... })
```

### 8.3 Conditional Rendering
```typescript
@if (condition) { <!-- render --> }
@for (item of items(); track item.id) { <!-- render --> }
@empty { <!-- fallback --> }
```

### 8.4 Event Handling
```typescript
// Method calls
(click)="handleClick()"

// Dialog/Modal toggling
<p-dialog [visible]="isDialogOpen()" (visibleChange)="isDialogOpen.set($event)">

// Drag & drop
(dragstart)="onDragStart(ticket)"
(drop)="onDrop('Pendiente', $event)"
```

---

## 9. MOCK DATA SUMMARY

| Entity | Count | Location | Status |
|--------|-------|----------|--------|
| Users | 4 | AppStateService | Mock ✓ |
| Groups | 3 | AppStateService | Mock ✓ |
| Tickets | 5 | AppStateService | Mock ✓ |
| Comments | 0 | In tickets | Empty |
| History | 0 | In tickets | Empty |

**Mock User Credentials:**
```
User 0: jesusefrainbocanegramata@gmail.com (Superadmin, all perms, all groups)
User 1: diegotristanlimon@gmail.com (Admin, groups 1,3)
User 2: luismontesvelazquez@gmail.com (Usuario, groups 1,2)
User 3: paulavaleriasancheztrejo@gmail.com (Dev, groups 1,3)
```

---

## 10. MISSING IMPLEMENTATIONS (For Backend Integration)

To connect the frontend to the backend, you need to:

1. **Create HTTP Service**
   ```typescript
   // src/app/services/api.service.ts
   - POST /auth/login
   - POST /auth/register
   - GET /tickets
   - GET /groups
   - etc.
   ```

2. **Replace AppStateService mock data calls with HTTP calls**
   ```typescript
   // Current: data from signal
   // Needed: HTTP request + signal update
   ```

3. **Add JWT token management**
   ```typescript
   // Store token in localStorage/sessionStorage
   // Add to all outgoing requests
   ```

4. **Add HTTP interceptor for authentication**
   ```typescript
   // Inject Authorization header on all requests
   // Handle 401 responses (refresh or redirect to login)
   ```

5. **Update components to handle loading states**
   ```typescript
   // Add isLoading signals
   // Show spinners during HTTP requests
   // Handle error responses
   ```

---

## 11. COMPONENT CHECKLIST

### Fully Implemented Components
- ✅ LoginComponent (auth/login) - Mock authentication
- ✅ GroupSelectionComponent (home) - Displays myGroups()
- ✅ DashboardComponent (groups/dashboard) - Shows group stats
- ✅ KanbanComponent (tickets/kanban) - Drag & drop board
- ✅ ListComponent (tickets/list) - Table view with sorting
- ✅ TicketDetailComponent (tickets/detail) - Modal detail view
- ✅ ProfileComponent (user/profile) - User stats
- ✅ SettingsComponent (groups/settings) - Group management
- ✅ UserSettingsComponent (admin/user-settings) - User admin panel
- ✅ MainLayoutComponent (layout) - Sidebar navigation
- ✅ AuthGuard - Protects authenticated routes
- ✅ LoginGuard - Prevents access to login page when authenticated
- ✅ PermissionService - Permission checking

### Ready for Enhancement
- Permission-based UI rendering (mostly done, uses @if blocks)
- Form validation (partially done)
- Error handling (minimal)
- Loading states (not implemented)
- Toast notifications (not implemented)

---

## 12. SYSTEM-WIDE DATA FLOW SUMMARY

```
User Login
  ↓ (Mock: LocalStorage of credentials)
AppStateService.login()
  ├─ Find user in systemUsers[]
  ├─ Set currentUser signal
  └─ Set isAuthenticated = true
  ↓
Router → /home
  ↓
AuthGuard checks isAuthenticated()
  ↓
GroupSelectionComponent
  ├─ Read: state.myGroups() [computed from currentUser.groups]
  └─ User clicks group
  ↓
AppStateService.selectGroup()
  ├─ Set selectedGroup signal
  └─ Triggers all group-related computeds
  ↓
GroupTickets computed signal recalculates
  ├─ Filters state.allTickets() by selectedGroup.id
  └─ Components re-render automatically
  ↓
DashboardComponent / KanbanComponent / ListComponent
  ├─ All read from groupTickets computed signal
  └─ Each implements its own view logic
  ↓
User clicks ticket
  ↓
AppStateService.selectedTicketId.set(id)
  ├─ Triggers selectedTicket computed
  └─ TicketDetailComponent modal opens
  ↓
User edits ticket
  ↓
AppStateService.updateTicket() OR addComment()
  ├─ Updates allTickets signal
  └─ All components re-render automatically
```

---

## CONCLUSION

The SIPNG frontend is a **fully structured, signals-based Angular application** with:
- ✅ Complete mock data system in AppStateService
- ✅ All UI components implemented with PrimeNG
- ✅ Computed signals for reactive data filtering
- ✅ Permission-based conditional rendering
- ✅ Drag & drop Kanban support
- ✅ Dialog-based detail views
- ✅ Group context management

**Next steps for backend integration:**
1. Create HttpClient-based API service
2. Replace AppStateService mock data with HTTP calls
3. Add JWT token management
4. Add loading/error handling
5. Implement HTTP interceptors for auth headers
