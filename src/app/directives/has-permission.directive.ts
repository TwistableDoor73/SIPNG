import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../services/app-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission: string | string[] = [];
  @Input() appHasPermissionElse: TemplateRef<any> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private appStateService: AppStateService
  ) {}

  ngOnInit(): void {
    // Verificar permisos iniciales
    this.updateView();

    // Suscribirse a cambios de usuario para re-evaluar permisos
    // (Nota: AppStateService usa signals, así que pudrías usar effect si prefieres)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const permissions = Array.isArray(this.appHasPermission)
      ? this.appHasPermission
      : [this.appHasPermission];

    const hasPermission = this.hasAllPermissions(permissions);

    if (hasPermission) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
      if (this.appHasPermissionElse) {
        this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
      }
    }
  }

  private hasAllPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission =>
      this.appStateService.hasPermission(permission)
    );
  }
}
