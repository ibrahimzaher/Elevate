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
        path: 'categories',
        loadComponent: () =>
          import('../../../feature/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'occasions',
        loadComponent: () =>
          import('../../../feature/occasions/occasions.component').then(
            (m) => m.OccasionsComponent
          ),
      },
      {
        path: 'shopping-cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../../../feature/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../../../feature/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent
          ),
      },
      {
        path: 'allOrders',
        canActivate: [authGuard],
        loadChildren: () =>
          import('../../../feature/orders/orders.routes').then(
            (m) => m.ordersRoutes
          ),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadChildren: () =>
          import('../../../feature/checkout/checkout.routes').then(
            (m) => m.checkoutRoutes
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadChildren: () =>
          import('../../../feature/profile/profile.routes').then(
            (m) => m.profileRoutes
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('../../../feature/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('../../../feature/about-us/about-us.component').then(
            (m) => m.AboutUsComponent
          ),
      },
    ],
  },
];
