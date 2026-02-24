import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SearchCriteria } from '../../../interfaces/search-criteria';

@Injectable({
  providedIn: 'root',
})
export class SearcherSidebarService {
  private readonly apiUrl = environment.backendGN;

  private readonly condicionBusquedaSubject = new BehaviorSubject<string>('');
  condicionBusqueda$: Observable<string> = this.condicionBusquedaSubject.asObservable();

  private readonly valorBuscadoStringSubject = new BehaviorSubject<string>('');
  valorStringBuscado$: Observable<string> = this.valorBuscadoStringSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  setCondicionBusqueda(data: string) {
    this.condicionBusquedaSubject.next(data);
  }

  getCondicionBusqueda(): string {
    return this.condicionBusquedaSubject.getValue();
  }

  setValorStringBuscado(data: string) {
    this.valorBuscadoStringSubject.next(data);
  }

  getValorStringBuscado(): string {
    return this.valorBuscadoStringSubject.getValue();
  }

  getSearchCriteria(): Observable<any> {
    const url = `${this.apiUrl}/tarjeta/consulta/circulo`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      //'x-entidad-id': idEntidad
    });
    return this.http.get<any>(url, { headers });
    // return [
    //   { name: 'cali', label: 'Cali', type: 'string' },
    //   { name: 'medellin', label: 'Medellín', type: 'string' },
    //   { name: 'villavicencio', label: 'Villavicencio', type: 'string' },      
    // ];
  }

  getIdPredioByNPN(
    NPM: string,
    idEntidad: string,
    idVisor: string
  ): Observable<any> {

    const obsIds = new Set(['1', '2']);
    const esObservatorio = obsIds.has(idVisor);
    //const url = `${this.apiUrl}/tarjeta/busqueda/terreno/${NPM}`;
    const url = `${this.apiUrl}/tarjeta/busqueda/terreno/${NPM}?esObservatorio=${esObservatorio}`;

    console.log('NPM => ', NPM)
    console.log('id Entidad => ', idEntidad)
    console.log('url => ', url)


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-entidad-id': idEntidad
    });
    // return of({
    //   "message": "Consulta exitosa",
    //   "status": "success",
    //   "data": {
    //       "predio_id": 24055
    //   }
    // });
    return this.http.get<any>(url, { headers });
  }

  getIdUbicacionByMatricula(
    Matricula: string,
    Circulo: string
  ): Observable<any> {

    const url = `${this.apiUrl}/tarjeta/consulta/oferta/fmi?folio=${Matricula}&circulo=${Circulo}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
      //'x-entidad-id': idEntidad
    });
    // return of({
    //   "message": "Consulta exitosa",
    //   "status": "success",
    //   "data": {
    //       "predio_id": 24055
    //   }
    // });
    return this.http.get<any>(url, { headers });
  }
}