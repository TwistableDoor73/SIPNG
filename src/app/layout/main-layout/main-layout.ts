import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {
  state = inject(AppStateService);
  router = inject(Router);

  get activeTab() {
    // Quick active tab indication based on the current parsed URL
    return this.router.url.split('?')[0].split('/').pop() || 'home';
  }

  logout() {
    this.state.logout();
    this.router.navigate(['/auth/login']);
  }

  backToGroups() {
    this.state.clearGroup();
    this.router.navigate(['/home']);
  }

  toggleProfile() {
    this.router.navigate(['/user/profile']);
  }

}
