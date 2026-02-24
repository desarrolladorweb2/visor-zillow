import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

export const sessionIdGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const id = route.queryParamMap.get('id');

  if (id) {
    return true;
  } else {
    return router.createUrlTree(['/error']);
  }
};
