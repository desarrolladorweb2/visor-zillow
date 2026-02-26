import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';

@Component({
  selector: 'app-container-card',
  imports: [CommonModule],
  templateUrl: './container-card.component.html',
  styleUrl: './container-card.component.less'
})
export class ContainerCardComponent {

  property = input.required<any>();

  // Signal para controlar la navegación interna de fotos si fuera necesario
  currentImgIndex = signal(0);

  toggleFavorite() {
    // Lógica para el corazón
  }


  // En el TS de la card
  constructor(private readonly containerModalCardService: ContainerModalCardService) { }

  onCardClick() {
    this.containerModalCardService.open(this.property());
  }
}
