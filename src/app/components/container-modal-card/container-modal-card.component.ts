import { Component, computed, effect, inject, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environment/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  isGeneratingPDF = signal(false);

  // URL Base de tu servidor de imágenes
  private readonly publicUrl = environment.imagenes;

  constructor() {
    effect(() => {
      const property = this.containerModalCardService.selectedProperty();

      if (property && property.images) {
        // Procesamos las imágenes que vienen del backend
        this.processImages(property.images);
      } else {
        this.imageList.set([]);
      }
    });
  }

  processImages(backendImages: string[]) {
    this.imageList.set(backendImages);
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
    this.containerModalCardService.isGalleryOnly.set(false);
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

  // 1. Obtiene MÁXIMO las primeras 2 fotos para rellenar la Hoja 1
  getFirstPagePhotos() {
    const photos = this.imageList() || [];
    return photos.slice(0, 2);
  }

  // 2. Toma todas las fotos sobrantes (de la 3 en adelante) y las agrupa de 6 en 6
  getRemainingPhotoChunks() {
    const photos = this.imageList() || [];
    const remaining = photos.slice(2); // Cortamos las 2 que ya usamos

    const chunkSize = 6;
    const chunks = [];
    for (let i = 0; i < remaining.length; i += chunkSize) {
      chunks.push(remaining.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // 2. FUNCIÓN DEFINITIVA DE DESCARGA
  async descargarPDF() {
    this.isGeneratingPDF.set(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'letter');
      // Capturamos todos los contenedores que actúan como "Hojas Carta"
      const pages = document.querySelectorAll('.pdf-page-wrapper');

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;

        // Tomamos la foto exacta del nodo (sin que jsPDF intente escalar nada)
        const canvas = await html2canvas(pageEl, {
          scale: 2, // Alta definición
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        // Medidas exactas de la hoja Carta en mm
        const pdfWidth = 215.9;
        const pdfHeight = 279.4;

        // Si no es la primera iteración, agregamos una nueva hoja al PDF
        if (i > 0) {
          pdf.addPage();
        }

        // Pegamos la imagen ocupando el 100% de la hoja (los márgenes ya vienen pintados de blanco desde el CSS)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const fileName = `Ficha_Inmueble_${this.containerModalCardService.selectedProperty()?.id}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      this.isGeneratingPDF.set(false);
    }
  }
}