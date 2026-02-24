import { inject } from "@angular/core";
import { TokenService } from "../services/auth/token.service";

export function initializeToken(): Promise<void> {
    const tokenService = inject(TokenService);
    return tokenService.genexusToken();
}
