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
      : this.http.get<any>(this.apiUrl + '/inmuebles');

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
          "solicitado": true,
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
          ],
          "solicitudes": [
            {
              "id": 1,
              "nombre": "Arnulfo Gutierrez",
              "email": "arnulfo.gutierrez@realtix.com",
              "telefono": "3123456789",
              "mensaje": "quiero este inmueble para verlo",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 1,
                  "estado": "desistido",
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                },
                {
                  "id": 2,
                  "estado": "contactado",
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 2,
              "nombre": "Arnold Zambra",
              "email": "arnold.zambra@realtix.com",
              "telefono": "3123456789",
              "mensaje": "En proceso",
              "fecha": "2026-03-06 17:34:20.589"
            }
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
          ],
          "solicitudes": []
        },
        {
          "id": 2,
          "solicitado": false,
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
          ],
          "solicitudes": []
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
          ],
          "solicitudes": []
        },
        {
          "id": 4,
          "solicitado": true,
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
          ],
          "solicitudes": [
            {
              "id": 1,
              "nombre": "Luisa Gutierrez",
              "email": "luisa.gutierrez@realtix.com",
              "telefono": "3113456781",
              "mensaje": "Conocer 1",
              "fecha": "",
              "estado": [
                {
                  "id": 1,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 2,
              "nombre": "Felipe Miranda",
              "email": "felipe.miranda@realtix.com",
              "telefono": "3103456780",
              "mensaje": "Conocer 2",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 3,
                  "estado": 5,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                },
                {
                  "id": 4,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 3,
              "nombre": "Juliana Gutierrez",
              "email": "juliana.gutierrez@realtix.com",
              "telefono": "3113456781",
              "mensaje": "Conocer 1",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 6,
                  "estado": 3,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                },
                {
                  "id": 5,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 4,
              "nombre": "Pedro Miranda",
              "email": "pedro.miranda@realtix.com",
              "telefono": "3103456780",
              "mensaje": "Conocer 2",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 7,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 6,
              "nombre": "samuel Gutierrez",
              "email": "samuel.gutierrez@realtix.com",
              "telefono": "3113456781",
              "mensaje": "Conocer 1",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 8,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 7,
              "nombre": "Oscar Miranda",
              "email": "oscar.miranda@realtix.com",
              "telefono": "3103456780",
              "mensaje": "Conocer 2",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 9,
                  "estado": 1,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 8,
              "nombre": "Mery Gutierrez",
              "email": "mery.gutierrez@realtix.com",
              "telefono": "3113456781",
              "mensaje": "Conocer 1",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 10,
                  "estado": 2,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            },
            {
              "id": 9,
              "nombre": "Flor Miranda",
              "email": "flor.miranda@realtix.com",
              "telefono": "3103456780",
              "mensaje": "Conocer 2",
              "fecha": "2026-03-06 17:34:20.589",
              "estado": [
                {
                  "id": 11,
                  "estado": 2,
                  "usuario": "sistema",
                  "fecha": "2026-03-06 17:34:20.589",
                  "observacion": "bla bla bla"
                }
              ]
            }
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

  cambiarEstadoSolicitud(idInmueble: number | string, formData: any): Observable<any> {
    if (this.useMock) {
      console.log(`--- Simulando cambio de estado para el Inmueble ${idInmueble}, Solicitud ${formData} ---`);

      // 1. Armamos SOLO el nuevo registro para el historial de gestión
      const nuevoHistorialEstado = {
        id_bien: Number(idInmueble),
        id_solicitud: formData.id_solicitud,
        id: Math.floor(Math.random() * 10000), // ID aleatorio para el registro del historial
        estado: formData.id_estado,             // El ID de la acción (ej. 2 para contactado)
        usuario: "asesor_inmobiliario",        // Simulamos el usuario logueado
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 23),
        observacion: formData.observacion
      };

      const mockResponse = {
        mensaje: "Gestión registrada correctamente",
        nuevo_estado: nuevoHistorialEstado
      };

      return of(mockResponse).pipe(
        delay(1500),
        tap((res) => {
          // --- AQUÍ HACEMOS LA MAGIA EN EL CACHÉ ---
          if (this.allPropertiesCache && this.allPropertiesCache.results) {

            // 1. Buscamos el bien por su ID
            const inmueble = this.allPropertiesCache.results.find((p: any) => p.id === Number(idInmueble));
            console.log('Inmueble encontrado:', inmueble);

            if (inmueble && inmueble.solicitudes) {

              // 2. Buscamos a la persona específica (la solicitud) dentro del inmueble
              const solicitudTarget = inmueble.solicitudes.find((s: any) => s.id === formData.id_solicitud);

              console.log('Solicitud encontrada:', solicitudTarget);
              if (solicitudTarget) {
                // 3. Si por alguna razón no tiene arreglo de estado, lo creamos
                if (!solicitudTarget.estado) solicitudTarget.estado = [];

                // 4. Agregamos EL NUEVO ESTADO DE PRIMERO en su historial
                solicitudTarget.estado.unshift(res.nuevo_estado);

                // 5. Disparamos tu Subject para avisarle a toda la app que este inmueble cambió
                this.propertyUpdated$.next(inmueble);
              }
            }
          }
        })
      );

    } else {
      // Petición real al backend
      const postUrl = `${this.apiUrl}/historico/crear`;

      return this.http.post(postUrl, formData).pipe(
        tap((res: any) => {
          // --- AQUÍ HACEMOS LA MAGIA EN EL CACHÉ ---
          if (this.allPropertiesCache && this.allPropertiesCache.results) {

            const inmueble = this.allPropertiesCache.results.find((p: any) => p.id === Number(idInmueble));

            if (inmueble && inmueble.solicitudes) {
              const solicitudTarget = inmueble.solicitudes.find((s: any) => s.id === formData.id_solicitud);

              if (solicitudTarget) {
                if (!solicitudTarget.estado) solicitudTarget.estado = [];

                // 1. Armamos el nuevo registro usando el formData (Igual que en el mock)
                // Si el backend te devuelve el ID real del nuevo registro en 'res.id', lo usamos. 
                // Si no, generamos uno temporal para que Angular no llore con el trackBy.
                const nuevoHistorialEstado = {
                  id_bien: Number(idInmueble),
                  id_solicitud: formData.id_solicitud,
                  id: res?.id || Math.floor(Math.random() * 10000),
                  estado: formData.id_estado,
                  usuario: "asesor_inmobiliario", // Idealmente aquí sacas el nombre de tu servicio de Auth
                  fecha: new Date().toISOString().replace('T', ' ').substring(0, 23),
                  observacion: formData.observacion
                };

                // 2. Insertamos el objeto reconstruido (ya no dependemos de res.nuevo_estado)
                solicitudTarget.estado.unshift(nuevoHistorialEstado);

                // 3. Disparamos la actualización
                this.propertyUpdated$.next(inmueble);
              }
            }
          }
        })
      );
    }
  }
}
