import { Route } from '@angular/router';
import { guestGuard } from '@elevate/auth-data-access';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./core/layout/main-layout/main.routes').then((m) => m.mainRoutes),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./feature/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./feature/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
