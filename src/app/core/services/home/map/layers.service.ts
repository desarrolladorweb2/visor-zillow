import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  //private selections: Record<string, Set<number>> = {};
  private selections: Record<string, Map<number, L.GeoJSON>> = {};

  private readonly selectionsLayerId$ = new BehaviorSubject<Record<string, Set<number>>>({});
  readonly changesLayerId$ = this.selectionsLayerId$.asObservable();

  private count = 0;

  /** Agregar un ID a la capa */
  addLayerId(layerName: string, id: number, layer?: L.GeoJSON): void {
    if (!this.selections[layerName]) {
      this.selections[layerName] = new Map<number, L.GeoJSON>();
    }
    if (layer) {
      // Si llega el objeto Layer, lo guardo en el Map
      this.selections[layerName].set(id, layer);
    } else {
      // Si no llega layer, solo reservo el ID sin objeto asociado
      this.selections[layerName].set(id, undefined as unknown as L.GeoJSON);
    }
    this.emitLayerId();
  }

  /** Eliminar un ID de la capa */
  removeLayerId(layerName: string, id: number): void {
    if (!this.selections[layerName]) return;
    this.selections[layerName].delete(id);
    this.emitLayerId();
  }

  /** Obtener los IDs de una capa */
  getLayerId(layerName: string): number[] {
    return this.selections[layerName]
      ? Array.from(this.selections[layerName].keys())
      : [];
  }

  /** Obtener el objeto Layer dado el ID y la capa */
  getLayerObject(layerName: string, id: number): L.GeoJSON | undefined {
    return this.selections[layerName]?.get(id);
  }

  /** Saber si un ID está en la capa */
  hasLayerId(layerName: string, id: number): boolean {
    return this.selections[layerName]?.has(id) ?? false;
  }

  clearLayerId(): void {
    this.selections = {};
    this.emitLayerId();
  }

  private emitLayerId(): void {
    // Emito una copia inmutable solo con los IDs
    const clone: Record<string, Set<number>> = {};
    Object.keys(this.selections).forEach((k) => {
      clone[k] = new Set(this.selections[k].keys());
    });
    this.selectionsLayerId$.next(clone);
  }

  increment(): number {
    this.count++;
    return this.count;
  }

  decrement() {
    if (this.count > 0) {
      this.count--;
    }
  }  

  getCount(): number {
    return this.count;
  }  
}
