import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';

export const appRoutes: Routes = [
  { path: '', component: AppShellComponent },
  {
    path: 'gad7',
    loadChildren: () =>
      import('./gad7/gad7.module').then((module) => module.Gad7Module)
  }
];
