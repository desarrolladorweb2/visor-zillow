import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { firstValueFrom } from 'rxjs';
import { Token } from '../../../interfaces/token';
import { GlobalUserParamService } from '../global-user-param.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly apiUrl = environment.backendGN;
  private token: string | null = null;

  constructor(private readonly http: HttpClient,
    private readonly globalParams: GlobalUserParamService
  ) { }

  async genexusToken(): Promise<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const gn = {
      "Gx_mode": "DSP"
    };
    try {
      const response = await firstValueFrom(this.http.post<Token>(`${this.apiUrl}/WS_Session`, gn, { headers }));
      this.token = response.User_Token;
      const role = response.Role;
      this.globalParams.setParams({ role });
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error; 
    }
  }

  getToken(): string | null {
    return this.token;
  }
}
