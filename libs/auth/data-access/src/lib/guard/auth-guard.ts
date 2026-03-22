import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(AuthStorageService);
  const router = inject(Router);

  if (storage.hasToken()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
