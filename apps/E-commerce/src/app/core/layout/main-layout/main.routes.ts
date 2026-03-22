import { Routes } from '@angular/router';
import { authGuard } from '@elevate/auth-data-access';
import { MainLayoutComponent } from './main-layout.component';

export const mainRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('../../../feature/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../../feature/products/products.component').then(
                (m) => m.ProductsComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../../feature/product-details/product.details').then(
                (m) => m.ProductDetailsComponent
              ),
          },
        ],
      },
      {
        path: 'shopping-cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../../../feature/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
    ],
  },
];
