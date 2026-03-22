import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepo } from '@elevate/auth-domain';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_TOAST } from '../constants/http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastrService);
  const router = inject(Router);
  const auth = inject(AuthRepo);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      if (typeof err.error === 'string') {
        message = err.error;
      } else {
        message = err.error?.message || err.error?.error || message;
      }

      if (err.status === 0) {
        message = 'Network error: Please check your connection';
      } else if (err.status >= 500) {
        message = 'Server error: Please try again later';
      }

      const isTokenError =
        err.status === 401 &&
        (message.toLowerCase().includes('jwt') ||
          message.toLowerCase().includes('token'));

      if (isTokenError) {
        message = 'Your session has expired. Please log in again.';
        auth.cleanData();
      }

      if (!req.context.get(SKIP_ERROR_TOAST)) {
        toast.error(message);
      }

      return throwError(() => ({ message, status: err.status }));
    })
  );
};
