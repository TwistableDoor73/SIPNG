import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  llmModel: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isAuthenticated = signal(false);
  selectedGroup: WritableSignal<Group | null> = signal(null);

  email = signal('usuario@ejemplo.com');
  password = signal('password123');

  groups: Group[] = [
    { id: '1', name: 'Equipo Dev', description: 'Desarrollo, análisis de código y arquitectura.', color: '#0ea5e9', llmModel: 'OpenAI GPT-4o', icon: 'pi-code' },
    { id: '2', name: 'Soporte', description: 'Sistema de atención y resolución de dudas.', color: '#10b981', llmModel: 'Claude 3.5 Sonnet', icon: 'pi-headphones' },
    { id: '3', name: 'UX & Diseño', description: 'Diseño de interfaces e ideación.', color: '#ec4899', llmModel: 'Google Gemini 1.5 Pro', icon: 'pi-palette' }
  ];

  login() {
    if (this.email() && this.password()) {
      this.isAuthenticated.set(true);
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.selectedGroup.set(null);
  }

  selectGroup(group: Group) {
    this.selectedGroup.set(group);
  }

  backToGroups() {
    this.selectedGroup.set(null);
  }
}
