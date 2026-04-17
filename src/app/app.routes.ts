import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'auth/login', 
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: '', 
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/group-selection/group-selection.component').then(m => m.GroupSelectionComponent) },
      { path: 'user/profile', loadComponent: () => import('./pages/user/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'groups/dashboard', loadComponent: () => import('./pages/groups/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'groups/settings', loadComponent: () => import('./pages/groups/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'tickets/kanban', loadComponent: () => import('./pages/tickets/kanban/kanban.component').then(m => m.KanbanComponent) },
      { path: 'tickets/list', loadComponent: () => import('./pages/tickets/list/list.component').then(m => m.ListComponent) },
      { path: 'tickets/detail/:id', loadComponent: () => import('./pages/tickets/detail/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'admin/user-settings', loadComponent: () => import('./pages/admin/user-settings/user-settings.component').then(m => m.UserSettingsComponent) },
      
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
