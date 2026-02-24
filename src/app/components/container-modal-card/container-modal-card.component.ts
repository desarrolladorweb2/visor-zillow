import { Component, computed, inject, signal } from '@angular/core';
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

  showFullGallery = signal(false);
  activePhotoIdx = signal(0);

  // Imágenes para el collage (máximo 5)
  collageImages = computed(() => {
    return this.containerModalCardService.selectedProperty()?.images?.slice(0, 5) || [];
  });

  totalPhotos = computed(() => {
    return this.containerModalCardService.selectedProperty()?.images?.length || 0;
  });

  closeModal() {
    this.showFullGallery.set(false);
    this.containerModalCardService.close();
  }

  openGallery(index: number = 0) {
    this.activePhotoIdx.set(index);
    this.showFullGallery.set(true);
  }

  // Métodos del carrusel pantalla completa
  nextPhoto() {
    const total = this.totalPhotos();
    this.activePhotoIdx.update(i => (i + 1) % total);
  }

  prevPhoto() {
    const total = this.totalPhotos();
    this.activePhotoIdx.update(i => (i - 1 + total) % total);
  }

  openContact() {
    this.containerModalCardService.openContactForm();
  }
}
