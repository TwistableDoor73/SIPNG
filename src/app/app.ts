import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html'
})
export class App {
  // App Component now acts solely as the entry point for the Angular Router.
  // All state has been moved to AppStateService.
  // All layouts have been moved to layout/main-layout.
  // All views have been moved to pages/*
}
