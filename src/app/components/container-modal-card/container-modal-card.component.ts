import { Component, computed, effect, inject, signal } from '@angular/core';
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

  // Arreglo local reactivo de imágenes
  public imageList = signal<string[]>([]);

  showFullGallery = signal(false);
  activePhotoIdx = signal(0);

  constructor() {
    effect(() => {
      const property = this.containerModalCardService.selectedProperty();

      if (property && property.id) {
        this.loadImages(property.id);
      } else {
        this.imageList.set([]);
      }
    });
  }

  async loadImages(id: string | number) {
    this.imageList.set([]); // Limpiamos el arreglo
    const validImages: string[] = [];

    for (let i = 1; i <= 15; i++) {
      const path = `assets/img/bien_id${id}_${i}.png`;
      const exists = await this.checkImageExists(path);

      if (exists) {
        validImages.push(path);
      } else {
        break;
      }
    }

    this.imageList.set(validImages);
  }

  checkImageExists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = path;
    });
  }

  // MODIFICACIÓN: Ahora leen de this.imageList() en vez de property?.images
  collageImages = computed(() => {
    return this.imageList().slice(0, 5);
  });

  totalPhotos = computed(() => {
    return this.imageList().length;
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
    if (total === 0) return;
    this.activePhotoIdx.update(i => (i + 1) % total);
  }

  prevPhoto() {
    const total = this.totalPhotos();
    if (total === 0) return;
    this.activePhotoIdx.update(i => (i - 1 + total) % total);
  }

  openContact() {
    this.containerModalCardService.openContactForm();
  }
}