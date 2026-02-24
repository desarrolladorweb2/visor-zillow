import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';
import { InformationCardObject } from '../../../interfaces/information-card';

@Injectable({
  providedIn: 'root'
})
export class InformationCardService {

  private readonly apiUrl = environment.backendGN;

  constructor(private readonly http: HttpClient) { }

  getSearchCriteria(): any[] {
    return [
      { name: 'AcreditadoNumCuen', label: 'ID de Crédito', type: 'number' },
      { name: 'AcreditadoNum', label: 'No. de Acreditado', type: 'number' },
      { name: 'AcreditadoIdenti', label: 'Identificación', type: 'string' }
    ];
  }

  getInformacionCard(filter: string, info: string, adress: string): Observable<InformationCardObject> {
    const url = `${this.apiUrl}/WS_TarjetaContacto1`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = {
      "Gx_mode": "DSP",
      [filter]: info,
      "Direccion_IdF": adress
    }
    return this.http.post<InformationCardObject>(url, body, { headers });
  }
}
