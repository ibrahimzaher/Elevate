import { Route } from '@angular/router';
import { guestGuard, adminGuard, userGuard } from '@elevate/auth-data-access';
import type { SeoMeta } from './core/interfaces/seo-meta.interface';
import { loadRemote } from '@module-federation/enhanced/runtime';

const notFoundSeo: SeoMeta = {
  title: 'Page Not Found | Elevate Gifts',
  description:
    'The page you are looking for could not be found. Return to Elevate Gifts to keep shopping flowers, gifts, and curated occasion collections.',
  robots: 'noindex, nofollow',
};

const unauthorizedSeo: SeoMeta = {
  title: 'Access Denied | Elevate Gifts',
  description: 'You do not have permission to access this page.',
  robots: 'noindex, nofollow',
};

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [userGuard],
    loadChildren: () =>
      import('./core/layout/main-layout/main.routes').then((m) => m.mainRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    loadChildren: () =>
      loadRemote<typeof import('dashboard/Routes')>('dashboard/Routes').then(
        (m) => m!.remoteRoutes
      ),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./feature/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'my-account',
    loadComponent() {
      return import('@elevate/my-account').then((m) => m.MyAccount);
    },
  },
  {
    path: 'change-password',
    loadComponent() {
      return import('@elevate/change-password').then((m) => m.ChangePassword);
    },
  },
  {
    path: 'unauthorized',
    data: {
      seo: unauthorizedSeo,
    },
    loadComponent: () =>
      import('./feature/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  {
    path: 'not-found',
    data: {
      seo: notFoundSeo,
    },
    loadComponent: () =>
      import('./feature/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },

  {
    path: '**',
    redirectTo: 'not-found',
    pathMatch: 'full',
  },
];
