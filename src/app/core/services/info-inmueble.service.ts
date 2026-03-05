import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { delay, map, Observable, of, Subject, tap } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class InfoInmuebleService {

  private readonly useMock: boolean = environment.pruebas;
  private allPropertiesCache: any = null;
  selectedPropertyId = signal<string | null>(null);
  propertyUpdated$ = new Subject<any>();
  private readonly apiUrl = environment.backendGN;
  private readonly urlImagenes = environment.imagenes;

  constructor(private readonly http: HttpClient) { }


  getProperties(filters: any): Observable<any> {
    if (this.allPropertiesCache) {
      return of(this.allPropertiesCache);
    }

    const request$ = this.useMock
      ? of(this.getMockData()).pipe(delay(3000))
      : this.http.get<any>(this.apiUrl + '/inmuebles', { params: filters });

    return request$.pipe(
      // Transformamos los resultados para concatenar la URL de las imágenes
      map(data => {
        if (data && data.results) {
          data.results = data.results.map((prop: any) => ({
            ...prop,
            images: prop.images ? prop.images.map((img: string) => `${this.urlImagenes}${img}`) : []
          }));
        }
        return data;
      }),
      tap(data => this.allPropertiesCache = data)
    );
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
          },
          "images": [
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
          ]
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
          },
          "images": [
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
          ]
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
          },
          "images": [
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
            '/0038-2025/Fotos del Bien/POC_Medellin.jpg',
          ]
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
          },
          "images": [
          ]
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
          },
          "images": [
          ]
        }
      ]
    }
  }

  solicitarInmueble(idInmueble: number | string, formData: any): Observable<any> {
    formData.id = idInmueble;

    if (this.useMock) {
      console.log(`--- Simulando POST para Inmueble ${idInmueble} ---`);
      console.log('Datos enviados:', formData);

      // Simulamos la respuesta del backend
      const mockResponse = {
        "mensaje": "Solicitud creada correctamente"
      }

      return of(mockResponse).pipe(delay(2000));

    } else {
      const postUrl = `${this.apiUrl}/solicitudes`;
      return this.http.post(postUrl, formData);
    }
  }
}
