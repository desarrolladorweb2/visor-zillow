import { Component, inject, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-container-modal-card',
  imports: [CommonModule],
  templateUrl: './container-modal-card.component.html',
  styleUrl: './container-modal-card.component.less'
})
export class ContainerModalCardComponent {

  public containerModalCardService = inject(ContainerModalCardService);

  // Variable para saber qué foto de la galería estamos viendo
  activeIdx = signal(0);

  // Función para ir a la siguiente imagen
  nextImg() {
    const images = this.containerModalCardService.selectedProperty()?.images || [];
    if (this.activeIdx() < images.length - 1) {
      this.activeIdx.update((v: any) => v + 1);
    } else {
      this.activeIdx.set(0); // Vuelve al principio
    }
  }

  // Función para ir a la imagen anterior
  prevImg() {
    const images = this.containerModalCardService.selectedProperty()?.images || [];
    if (this.activeIdx() > 0) {
      this.activeIdx.update((v: any) => v - 1);
    } else {
      this.activeIdx.set(images.length - 1); // Va al final
    }
  }
}
