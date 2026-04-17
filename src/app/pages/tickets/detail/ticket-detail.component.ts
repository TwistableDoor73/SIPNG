import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { AppStateService, TicketStatus, TicketPriority } from '../../../services/app-state.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DialogModule, 
    TabsModule, 
    InputTextModule, 
    TextareaModule, 
    SelectModule, 
    ButtonModule,
    DividerModule,
    TagModule,
    DatePickerModule
  ],
  template: `
    <p-dialog 
      [header]="'Detalles del Ticket: ' + (ticket()?.id || '')" 
      [visible]="!!state.selectedTicketId()" 
      (visibleChange)="close()"
      [modal]="true" 
      [style]="{ width: '70vw', maxWidth: '800px' }" 
      [draggable]="false" 
      [resizable]="false"
      styleClass="ticket-detail-dialog"
      appendTo="body"
    >
      @if (ticket()) {
        <div class="ticket-detail-container">
          <!-- Main Content -->
          <div class="grid flex" style="display: flex; gap: 1rem;">
            <div class="col-8 pr-4" style="flex: 2; border-right: 1px solid rgba(255,255,255,0.1);">
              <!-- Title & Description -->
              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Título</label>
                <input 
                  pInputText 
                  class="w-full custom-input-filled" 
                  [(ngModel)]="editData.title" 
                  [disabled]="!canEditFull()"
                />
              </div>

              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Descripción</label>
                <textarea 
                  pTextarea 
                  class="w-full custom-input-filled" 
                  rows="5" 
                  [(ngModel)]="editData.description" 
                  [disabled]="!canEditFull()"
                  [autoResize]="true"
                ></textarea>
              </div>

              <p-divider></p-divider>

              <!-- Tabs: Comments & History -->
              <p-tabs value="comments" styleClass="mt-2">
                <p-tablist>
                  <p-tab value="comments">Comentarios</p-tab>
                  <p-tab value="history">Historial</p-tab>
                </p-tablist>
                <p-tabpanels>
                  <p-tabpanel value="comments">
                    <div class="comments-list mb-3" style="max-height: 250px; overflow-y: auto;">
                      @for (comment of ticket()?.comments; track $index) {
                        <div class="comment-item mb-2 p-3 glass-card" style="background: rgba(255,255,255,0.03); border-radius: 8px;">
                          <div class="flex justify-content-between mb-1" style="display: flex; justify-content: space-between;">
                            <strong class="text-primary">{{comment.author.split('@')[0]}}</strong>
                            <small class="text-secondary">{{comment.date | date:'short'}}</small>
                          </div>
                          <p class="m-0 text-sm">{{comment.text}}</p>
                        </div>
                      } @empty {
                        <p class="text-secondary italic text-center py-4">Sin comentarios aún.</p>
                      }
                    </div>
                    
                    @if (state.hasPermission('ticket:comment')) {
                      <div class="comment-input flex gap-2" style="display: flex; gap: 0.5rem;">
                        <input pInputText class="flex-grow-1" style="flex: 1" [(ngModel)]="newCommentText" placeholder="Escribe un comentario..." (keyup.enter)="postComment()" />
                        <p-button icon="pi pi-send" (onClick)="postComment()" [disabled]="!newCommentText.trim()"></p-button>
                      </div>
                    }
                  </p-tabpanel>
                  
                  <p-tabpanel value="history">
                    <div class="history-list" style="max-height: 250px; overflow-y: auto;">
                      @for (item of ticket()?.history; track $index) {
                        <div class="history-item mb-2 p-2 flex gap-3 align-items-center" style="display: flex; gap: 1rem; align-items: center;">
                          <i class="pi pi-history text-secondary"></i>
                          <div>
                            <p class="m-0 text-sm"><strong>{{item.author.split('@')[0]}}</strong> {{item.action}}</p>
                            <small class="text-secondary">{{item.date | date:'short'}}</small>
                          </div>
                        </div>
                      }
                    </div>
                  </p-tabpanel>
                </p-tabpanels>
              </p-tabs>
            </div>

            <div class="col-4 pl-4" style="flex: 1;">
              <!-- Sidebar Metadata -->
              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Estado</label>
                <p-select 
                   [options]="statusOptions" 
                   [(ngModel)]="editData.status" 
                   styleClass="w-full" 
                   [disabled]="!canEditStatus()"
                   appendTo="body"
                ></p-select>
              </div>

              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Prioridad</label>
                <p-select 
                   [options]="priorityOptions" 
                   [(ngModel)]="editData.priority" 
                   styleClass="w-full" 
                   [disabled]="!canEditFull()"
                   appendTo="body"
                ></p-select>
              </div>

              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Asignado a</label>
                <p-select 
                   [options]="memberOptions()" 
                   optionLabel="label" 
                   optionValue="value"
                   [(ngModel)]="editData.assignedToUuid" 
                   styleClass="w-full" 
                   [disabled]="!canEditFull()"
                   placeholder="Sin asignar"
                   [showClear]="true"
                   [filter]="true"
                   filterBy="label"
                   appendTo="body"
                ></p-select>
                @if (canEditFull()) {
                  <small class="cursor-pointer text-primary" (click)="editData.assignedToUuid = state.currentUser().id">Asignarme a mí</small>
                }
              </div>

              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Fecha de inicio</label>
                <p-datepicker
                  [(ngModel)]="editData.startDate"
                  [showClear]="true"
                  [disabled]="!canEditFull()"
                  dateFormat="dd/mm/yy"
                  placeholder="Sin fecha"
                  styleClass="w-full"
                  appendTo="body"
                ></p-datepicker>
              </div>

              <div class="field mb-4">
                <label class="block mb-2 font-bold text-secondary">Fecha de finalización</label>
                <p-datepicker
                  [(ngModel)]="editData.endDate"
                  [showClear]="true"
                  [disabled]="!canEditFull()"
                  dateFormat="dd/mm/yy"
                  placeholder="Sin fecha"
                  styleClass="w-full"
                  appendTo="body"
                ></p-datepicker>
              </div>

              <div class="metadata-info mt-4 p-3 border-round bg-black-alpha-20" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                <div class="mb-2">
                  <small class="block text-secondary" style="display: block; opacity: 0.7;">Creador</small>
                  <span>{{ticket()?.creator}}</span>
                </div>
                <div class="mb-2">
                  <small class="block text-secondary" style="display: block; opacity: 0.7;">Fecha creación</small>
                  <span>{{ticket()?.createdAt | date:'mediumDate'}}</span>
                </div>
                <div>
                  <small class="block text-secondary" style="display: block; opacity: 0.7;">Fecha límite</small>
                  <span>{{ticket()?.dueDate ? (ticket()?.dueDate | date:'mediumDate') : 'Sin fecha'}}</span>
                </div>
              </div>
              
              <div class="flex flex-column gap-2 mt-4" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <p-button 
                   label="Guardar cambios" 
                   icon="pi pi-check" 
                   class="w-full" 
                   (onClick)="save()" 
                   [disabled]="!hasChanges()"
                ></p-button>
                <p-button 
                   label="Cerrar" 
                   [text]="true" 
                   severity="secondary" 
                   class="w-full" 
                   (onClick)="close()"
                ></p-button>
              </div>
            </div>
          </div>
        </div>
      }
    </p-dialog>
  `,
  styles: [`
    .text-secondary { color: #94a3b8; }
    :host ::ng-deep .ticket-detail-dialog .p-dialog-content {
      padding: 1.5rem;
    }
  `]
})
export class TicketDetailComponent {
  state = inject(AppStateService);
  httpService = inject(HttpService);

  ticket = this.state.selectedTicket;
  
  statusOptions: TicketStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
  priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

  memberOptions = computed(() => {
    return this.state.groupMembers().map((m: any) => ({
      label: `${m.name} (${m.email})`,
      value: m.uuid
    }));
  });

  editData: any = {
    title: '',
    description: '',
    status: '',
    priority: '',
    assignedToUuid: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  };

  newCommentText = '';

  constructor() {
    effect(() => {
      const t = this.ticket();
      if (t) {
        this.editData = {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assignedToUuid: t.assignedToUuid || '',
          startDate: t.startDate ? new Date(t.startDate) : null,
          endDate: t.endDate ? new Date(t.endDate) : null
        };
      }
    });
  }

  canEditFull(): boolean {
    const t = this.ticket();
    if (!t) return false;
    return t.creator === this.state.currentUser().email;
  }

  canEditStatus(): boolean {
    const t = this.ticket();
    if (!t) return false;
    const user = this.state.currentUser();
    return t.creator === user.email || t.assignedToUuid === user.id;
  }

  hasChanges(): boolean {
    const t = this.ticket();
    if (!t) return false;
    return this.editData.title !== t.title ||
           this.editData.description !== t.description ||
           this.editData.status !== t.status ||
           this.editData.priority !== t.priority ||
           (this.editData.assignedToUuid || '') !== (t.assignedToUuid || '') ||
           this.dateChanged(this.editData.startDate, t.startDate) ||
           this.dateChanged(this.editData.endDate, t.endDate);
  }

  private dateChanged(editDate: Date | null, origDate: Date | null): boolean {
    if (!editDate && !origDate) return false;
    if (!editDate || !origDate) return true;
    return new Date(editDate).toDateString() !== new Date(origDate).toDateString();
  }

  save() {
    const t = this.ticket();
    if (!t) return;

    const backendUpdates: any = {};

    if (this.editData.title !== t.title) backendUpdates.title = this.editData.title;
    if (this.editData.description !== t.description) backendUpdates.description = this.editData.description;
    if (this.editData.status !== t.status) backendUpdates.status = this.editData.status;
    if (this.editData.priority !== t.priority) backendUpdates.priority = this.editData.priority;
    if ((this.editData.assignedToUuid || '') !== (t.assignedToUuid || '')) {
      backendUpdates.assignedToId = this.editData.assignedToUuid || null;
    }
    if (this.dateChanged(this.editData.startDate, t.startDate)) {
      backendUpdates.startDate = this.editData.startDate || null;
    }
    if (this.dateChanged(this.editData.endDate, t.endDate)) {
      backendUpdates.endDate = this.editData.endDate || null;
    }

    if (Object.keys(backendUpdates).length === 0) return;

    this.httpService.updateTicket(t.id, backendUpdates).subscribe({
      next: (res) => {
        // Find the assigned user name from members
        const assignedMember = this.state.groupMembers().find((m: any) => m.uuid === this.editData.assignedToUuid);
        // Update local state
        this.state.updateTicket(t.id, {
          ...this.editData,
          assignedTo: assignedMember?.email || '',
          assignedToName: assignedMember?.name || '',
          assignedToUuid: this.editData.assignedToUuid || '',
          startDate: this.editData.startDate,
          endDate: this.editData.endDate
        });
      },
      error: (err) => {
        console.error('Error updating ticket:', err);
      }
    });
  }

  postComment() {
    const t = this.ticket();
    if (t && this.newCommentText.trim()) {
      this.state.addComment(t.id, this.newCommentText);
      this.newCommentText = '';
    }
  }

  close() {
    this.state.selectedTicketId.set(null);
  }
}
