import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LocationMap } from '../../../../interfaces/location-map';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  /** Estado reactivo con la ubicación actual del mapa (lat, lng, zoom). */
  private readonly locationSubject = new BehaviorSubject<LocationMap>({
    location: [4.74129, -73.71826],
    zoom: 6
  });
  public readonly location$: Observable<LocationMap> = this.locationSubject.asObservable();

  /** Emisión de puntos (por ejemplo, marcadores o coordenadas seleccionadas). */
  private readonly pointDataSubject = new BehaviorSubject<any>(null);
  public readonly pointData$: Observable<any> = this.pointDataSubject.asObservable();

  /** Emisión de coordenadas simples (lat, lng). */
  private readonly pointDataParamSubject = new Subject<[number, number]>();
  public readonly pointDataParam$: Observable<[number, number]> = this.pointDataParamSubject.asObservable();

  constructor() {}

  /**
   * Retorna la ubicación inicial del mapa.
   */
  getLocationInitial(): LocationMap {
    return this.locationSubject.value;
  }

  /**
   * Actualiza la ubicación completa del mapa (centro + zoom).
   */
  updateLocation(location: [number, number], zoom: number): void {
    this.locationSubject.next({ location, zoom });
  }

  /**
   * Actualiza datos del punto actual (por ejemplo, un marcador).
   */
  updatePointData(data: any): void {
    this.pointDataSubject.next(data);
  }

  /**
   * Emite coordenadas simples (lat, lng) para otros componentes.
   */
  emitPoint(lat: number, lng: number): void {
    this.pointDataParamSubject.next([lat, lng]);
  }
}
