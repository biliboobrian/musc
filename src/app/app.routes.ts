import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sessions', pathMatch: 'full' },
  {
    path: 'sessions',
    loadComponent: () => import('./pages/session-list/session-list.component').then(m => m.SessionListComponent)
  },
  {
    path: 'session/:id',
    loadComponent: () => import('./pages/session-edit/session-edit.component').then(m => m.SessionEditComponent)
  },
  {
    path: 'workout/:id',
    loadComponent: () => import('./pages/workout/workout.component').then(m => m.WorkoutComponent)
  },
  {
    path: 'summary',
    loadComponent: () => import('./pages/workout-summary/workout-summary.component').then(m => m.WorkoutSummaryComponent)
  },
  {
    path: 'history/:id',
    loadComponent: () => import('./pages/session-history/session-history.component').then(m => m.SessionHistoryComponent)
  },
  { path: '**', redirectTo: 'sessions' }
];
