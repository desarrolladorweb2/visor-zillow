import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { delay, Observable, of, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoInmuebleService {

  private readonly useMock = true;
  private allPropertiesCache: any = null;
  selectedPropertyId = signal<string | null>(null);
  propertyUpdated$ = new Subject<any>();
  private readonly apiUrl = 'https://tu-api-real.com/api/properties';

  constructor(private readonly http: HttpClient) { }


  getProperties(filters: any): Observable<any> {
    if (this.allPropertiesCache) {
      // Si ya tenemos los datos, los devolvemos sin delay
      return of(this.allPropertiesCache);
    }

    if (this.useMock) {
      console.log('--- Cargando Mock Data (5s delay) ---');
      return of(this.getMockData()).pipe(
        delay(3000),
        tap(data => this.allPropertiesCache = data)
      );
    } else {
      // Cuando lo pongas real, pasas los filtros como params
      return this.http.get(this.apiUrl, { params: filters }).pipe(
        tap(data => this.allPropertiesCache = data)
      );
    }
  }

  private getMockData() {
    return {
      "results": [
        {
          "id": 5,
          "solicitado": false,
          "valor_inmueble": 1000000000,
          "tipo_bien": "Casa",
          "tipo_bien_id": 1,
          "area_terreno": 100,
          "area_construida": 200,
          "tipo_predio": "Rural",
          "tipo_predio_id": 1,
          "clasificacion": "clasificacion1",
          "clasificacion_id": 1,
          "departamento": "Valle del Cauca",
          "departamento_id": 1,
          "municipio": "Cali",
          "municipio_id": 1,
          "direccion": "carrera 28 # 3-333",
          "barrio": "Santa Teresa",
          "estrato": "2",
          "coordinates": {
            "lat": 3.45961,
            "lng": -76.533085
          }
        },
        {
          "id": 1,
          "solicitado": false,
          "valor_inmueble": 400000,
          "tipo_bien": "Hotel",
          "tipo_bien_id": 2,
          "area_terreno": 100,
          "area_construida": 200,
          "tipo_predio": "Urbano",
          "tipo_predio_id": 2,
          "clasificacion": "Inmueble",
          "clasificacion_id": 2,
          "departamento": "Antioquia",
          "departamento_id": 2,
          "municipio": "Medellin",
          "municipio_id": 2,
          "direccion": "carrera 7A # 4-533",
          "barrio": "Poblado",
          "estrato": "2",
          "coordinates": {
            "lat": 6.259036,
            "lng": -75.586827
          }
        },
        {
          "id": 2,
          "solicitado": true,
          "valor_inmueble": 1349900,
          "tipo_bien": "Apartamento",
          "tipo_bien_id": 3,
          "area_terreno": 72,
          "area_construida": 72,
          "tipo_predio": "Urbano",
          "tipo_predio_id": 2,
          "clasificacion": "Inmueble",
          "clasificacion_id": 2,
          "departamento": "Antioquia",
          "departamento_id": 2,
          "municipio": "Medellin",
          "municipio_id": 2,
          "direccion": "Calle 79 No 72A 64",
          "barrio": "Laureles",
          "estrato": "4",
          "coordinates": {
            "lat": 6.27882,
            "lng": -75.58078
          }
        },
        {
          "id": 3,
          "solicitado": false,
          "valor_inmueble": 300000000,
          "tipo_bien": "Terreno",
          "tipo_bien_id": 4,
          "area_terreno": 40050,
          "area_construida": 0,
          "tipo_predio": "Rural",
          "tipo_predio_id": 1,
          "clasificacion": "Inmueble",
          "clasificacion_id": 2,
          "departamento": "Meta",
          "departamento_id": 4,
          "municipio": "Villavicencio",
          "municipio_id": 4,
          "direccion": "VILLA MORALIA",
          "barrio": "VILLA MORALIA",
          "estrato": "3",
          "coordinates": {
            "lat": 4.131045,
            "lng": -73.566847
          }
        },
        {
          "id": 4,
          "solicitado": false,
          "valor_inmueble": 50000000,
          "tipo_bien": "Hotel",
          "tipo_bien_id": 2,
          "area_terreno": 40050,
          "area_construida": 0,
          "tipo_predio": "Rural",
          "tipo_predio_id": 1,
          "clasificacion": "clasificacion1",
          "clasificacion_id": 1,
          "departamento": "Meta",
          "departamento_id": 4,
          "municipio": "Villavicencio",
          "municipio_id": 4,
          "direccion": "EL POTRILLO Y LA POTRILLA",
          "barrio": "EL POTRILLO Y LA POTRILLA",
          "estrato": "3",
          "coordinates": {
            "lat": 4.131045,
            "lng": -73.566847
          }
        }
      ]
    }
  }

  solicitarInmueble(idInmueble: number | string, formData: any): Observable<any> {
    // Aquí iría tu this.http.post(...)

    // Simulamos la respuesta del backend que pides:
    const mockResponse = {
      "id": idInmueble,
      "solicitado": true,
      "valor_inmueble": 1000000000,
      "tipo_bien": "Casa",
      "tipo_bien_id": 1,
      "area_terreno": 100,
      "area_construida": 200,
      "tipo_predio": "rural",
      "tipo_predio_id": 1,
      "clasificacion": "clasificacion1",
      "clasificacion_id": 1,
      "departamento": "Valle del Cauca",
      "departamento_id": 1,
      "municipio": "Cali",
      "municipio_id": 1,
      "direccion": "carrera 28 # 3-333",
      "barrio": "Santa Teresa",
      "estrato": "2",
      "coordinates": {
        "lat": 3.45961,
        "lng": -76.533085
      }
    }

    return of(mockResponse).pipe(delay(2000));
  }
}
