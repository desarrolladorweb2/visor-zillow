import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { DialogService } from '../services/shared/dialog.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const dialogService = inject(DialogService);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        router.navigate(['/error']); 
        dialogService.closeAll();
      }
      return throwError(() => error);
    })
  );
};
