import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';
import { ContainerModalCardComponent } from "../container-modal-card/container-modal-card.component";

@Component({
  selector: 'app-detalle-listado-solicitudes',
  imports: [CommonModule, ContainerModalCardComponent],
  templateUrl: './detalle-listado-solicitudes.component.html',
  styleUrl: './detalle-listado-solicitudes.component.less'
})
export class DetalleListadoSolicitudesComponent {

  public containerModalCardService = inject(ContainerModalCardService);
  property = input.required<any>();

  // Emisores para comunicarse con el componente padre (la tabla)
  volver = output<void>();

  // --- VARIABLES PARA EL PANEL DE SOLICITUDES ---
  solicitudSeleccionada = signal<any | null>(null);
  dropdownOpen = signal<boolean>(false);

  onVolver() {
    this.volver.emit();
  }

  abrirGaleria() {
    this.containerModalCardService.isGalleryOnly.set(true); // Encendemos el modo "Solo Galería"
    this.containerModalCardService.open(this.property());   // Abrimos el modal pasándole el inmueble actual
  }

  seleccionarSolicitud(solicitud: any) {
    this.solicitudSeleccionada.set(solicitud);
    this.dropdownOpen.set(false); // Cierra el menú de acciones si estaba abierto
  }

  cerrarDetalleSolicitud() {
    this.solicitudSeleccionada.set(null);
    this.dropdownOpen.set(false);
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  // Método auxiliar para dar color a los estados (Nuevo, Contactado, etc.)
  getEstadoClass(estado: string | undefined): string {
    const est = (estado || 'Nuevo').toLowerCase();
    if (est === 'nuevo') return 'badge-nuevo';
    if (est === 'contactado') return 'badge-contactado';
    return 'badge-default';
  }
}
