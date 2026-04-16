import { Route } from '@angular/router';

export const HOME_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./home.component').then(m => m.HomeComponent)
  }
];