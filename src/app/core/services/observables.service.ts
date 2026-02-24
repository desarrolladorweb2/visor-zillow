import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private estadoZoom = new BehaviorSubject<number>(0);
  zoomActual$ = this.estadoZoom.asObservable();

  actualizarZoom(nuevoValor: number): void {
    this.estadoZoom.next(nuevoValor); 
  }
}