import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../services/app-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper animate-in">
      <div class="profile-header-card glass-card">
        <div class="profile-info-banner">
          <img [src]="state.currentUser().avatarUrl" alt="Profile" class="profile-large-avatar" />
          <div class="profile-details">
            <h2>{{state.currentUser().name}}</h2>
            <p><i class="pi pi-envelope"></i> {{state.currentUser().email}}</p>
            <p><i class="pi pi-briefcase"></i> {{state.currentUser().role}}</p>
          </div>
        </div>
        <div class="profile-stats mt-4">
          <div class="stat-card">
            <span class="stat-value">{{state.myAllAssignedTickets().length}}</span>
            <span class="stat-label">Tickets Asignados</span>
          </div>
          <div class="stat-card pending">
            <span class="stat-value text-orange-400">{{state.myPendingCount()}}</span>
            <span class="stat-label">Pendientes</span>
          </div>
          <div class="stat-card in-progress">
            <span class="stat-value text-blue-400">{{state.myInProgressCount()}}</span>
            <span class="stat-label">En Progreso</span>
          </div>
          <div class="stat-card done">
            <span class="stat-value text-emerald-400">{{state.myDoneCount()}}</span>
            <span class="stat-label">Completados</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  state = inject(AppStateService);
}
