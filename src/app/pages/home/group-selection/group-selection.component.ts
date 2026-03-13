import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AppStateService, Group } from '../../../services/app-state.service';

@Component({
  selector: 'app-group-selection',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="page-wrapper animate-in">
      <div class="page-header">
        <h2>Mis Grupos</h2>
        <p>Selecciona un espacio de trabajo</p>
      </div>
      <div class="groups-grid mt-4">
        @for (group of state.groups; track group.id) {
        <p-card styleClass="glass-card group-card cursor-pointer" (click)="onSelectGroup(group)">
          <div class="group-content">
            <div class="group-icon" [style.color]="group.color">
              <i class="pi {{group.icon}}"></i>
            </div>
            <h3>{{group.name}}</h3>
            <p>{{group.description}}</p>
          </div>
        </p-card>
        }
      </div>
    </div>
  `
})
export class GroupSelectionComponent {
  state = inject(AppStateService);
  router = inject(Router);

  onSelectGroup(group: Group) {
    this.state.selectGroup(group);
    this.router.navigate(['/groups/dashboard']);
  }
}
