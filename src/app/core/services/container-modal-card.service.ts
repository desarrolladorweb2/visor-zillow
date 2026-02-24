import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContainerModalCardService {

  selectedProperty = signal<any | null>(null);
  isOpen = signal(false);

  open(property: any) {
    this.selectedProperty.set(property);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden'; // Bloquea scroll del fondo
  }

  close() {
    this.isOpen.set(false);
    this.selectedProperty.set(null);
    document.body.style.overflow = 'auto';
  }
}
