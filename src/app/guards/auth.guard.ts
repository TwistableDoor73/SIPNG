import { Injectable } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AppStateService } from '../services/app-state.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  appState = inject(AppStateService),
  router = inject(Router)
) => {
  if (appState.isAuthenticated()) {
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};

export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  appState = inject(AppStateService),
  router = inject(Router)
) => {
  if (appState.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};
