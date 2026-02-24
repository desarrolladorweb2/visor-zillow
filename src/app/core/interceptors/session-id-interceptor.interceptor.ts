import { HttpInterceptorFn } from '@angular/common/http';
import { GetSessionIdParamsService } from '../services/get-session-id-params.service';
import { inject } from '@angular/core';
import { TokenService } from '../services/auth/token.service';

export const sessionIdInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const idParams = inject(GetSessionIdParamsService);
  const idsession = idParams.sessionId

  if (idsession != null) {
    const tokenService = inject(TokenService);
    const token = tokenService.getToken();
    if (token) {
      const cloned = req.clone({
        withCredentials: true,  // Esto indica que se envíen credenciales (cookies, etc.)
        setHeaders: token ? { 
          Authorization: `${token}` 
        } : {}
      });
      return next(cloned);
    } else {
      return next(req);
    }
  }
  return next(req);
}; 
