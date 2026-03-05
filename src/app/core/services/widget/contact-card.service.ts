import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactCardService {
  private readonly apiUrl = environment.backendGN;

  constructor(private readonly http: HttpClient) { }

  getInformacionCardTerreno(data: any): Observable<any> {
    const url = `${this.apiUrl}/tarjeta/consulta/terreno/${data.id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-entidad-id': data.entidad
    });
    // return of({
    //   status: 'success',
    //   message: 'No se encontró información para el ID: 1',
    //   data: {
    //     npn: 123,
    //     nupre: 456,
    //     manzana: 789,
    //     condicion: 'Buena',
    //     direccion: 'Calle Falsa 123',
    //     destinacion: 'Residencial',
    //     numero_terreno: 101112,
    //     area_catrastal: 567777,
    //     area_total_construida: 2342343,
    //   }
    // });
    return this.http.get<any>(url, { headers });
  }

  getInformacionCardOferta(data: any): Observable<any> {
    //const id = '1013934'
    //const url = `${this.apiUrl}/tarjeta/consulta/oferta/${id}`;
    const url = `${this.apiUrl}/tarjeta/consulta/oferta/${data.id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-entidad-id': data.entidad
    });
    // return of({
    //   status: 'success',
    //   message: 'No se encontró información para el ID: 1',
    //   data: {
    //     npn: 123,
    //     nupre: 456,
    //     manzana: 789,
    //     condicion: 'Buena',
    //     direccion: 'Calle Falsa 123',
    //     destinacion: 'Residencial',
    //     numero_terreno: 101112,
    //     area_catrastal: 567777,
    //     area_total_construida: 2342343,
    //   }
    // });
    return this.http.get<any>(url, { headers });
  }

  getInformacionCardUnidades(data: any): Observable<any> {
    const url = `${this.apiUrl}/tarjeta/consulta/construccion/${data.id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-entidad-id': data.entidad
    });
    return this.http.get<any>(url, { headers });
  }

  getInformacionCardAsset(data: any): Observable<any> {
    if (environment.pruebas) {
      return of({
        status: 'success',
        message: 'No se encontró información para el ID: 1',
        data: {
          npn: 123,
          nupre: 456,
          manzana: 789,
          condicion: 'Buena',
          direccion: 'Calle Falsa 123',
          destinacion: 'Residencial',
          numero_terreno: 101112,
          area_catrastal: 567777,
          area_total_construida: 2342343,
          images: [
            "/0038-2025/Fotos del Bien/POC_Medellin.jpg",
            "/0038-2025/Fotos del Bien/POC_Medellin.jpg",
            "/0038-2025/Fotos del Bien/POC_Medellin.jpg"
          ]
        }
      });
    }
    const url = `${this.apiUrl}/tarjeta/consulta/oferta/${data.id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      //'x-entidad-id': data.entidad
    });
    return this.http.get<any>(url, { headers });
  }
}
