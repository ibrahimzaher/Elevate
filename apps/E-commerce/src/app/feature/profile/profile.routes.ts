import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile').then((m) => m.Profile),
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'details',
        loadComponent: () =>
          import('./components/profile-details/profile-details').then(
            (m) => m.ProfileDetails
          ),
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./components/profile-security/profile-security').then(
            (m) => m.ProfileSecurity
          ),
      },
    ],
  },
];
