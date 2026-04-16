import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./pages/shop/shop.routes').then(m => m.SHOP_ROUTES)
  }
];