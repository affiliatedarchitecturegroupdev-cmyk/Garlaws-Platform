import { Route } from '@angular/router';

export const SHOP_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./shop.component').then(m => m.ShopComponent)
  }
];