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

  private readonly ESTADOS_MAP: Record<number, string> = {
    1: 'Nuevo',
    2: 'Contactado',
    3: 'Visita programada',
    4: 'Proceso de Venta',
    5: 'Desistido'
  };

  public containerModalCardService = inject(ContainerModalCardService);
  property = input.required<any>();

  // Emisores para comunicarse con el componente padre (la tabla)
  volver = output<void>();

  // --- VARIABLES PARA EL PANEL DE SOLICITUDES ---
  solicitudSeleccionada = signal<any | null>(null);
  dropdownOpen = signal<boolean>(false);

  // --- VARIABLES PARA EL MODAL DE ACCIONES ---
  isActionModalOpen = signal<boolean>(false);
  selectedAction = signal<string>('');
  actionObservation = signal<string>('');

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
  getEstadoClass(estado: number | undefined): string {
    if (estado === 1) return 'badge-nuevo';
    if (estado === 2) return 'badge-contactado';
    if (estado === 3) return 'badge-default';
    if (estado === 4) return 'badge-default';
    if (estado === 5) return 'badge-desistido';
    return 'badge-default';
  }

  getEstadoNombre(estado: number | undefined): string {
    if (estado === 1) return 'Nuevo';
    if (estado === 2) return 'Contactado';
    if (estado === 3) return 'Visita programada';
    if (estado === 4) return 'Proceso de Venta';
    if (estado === 5) return 'Desistido';
    return 'N/A';
  }

  // MÉTODOS DEL MODAL DE ACCIONES
  openActionModal(actionName: string, event: Event) {
    event.preventDefault(); // Evita que el enlace recargue la página
    this.selectedAction.set(actionName);
    this.actionObservation.set(''); // Limpiamos la observación anterior
    this.isActionModalOpen.set(true);
    this.dropdownOpen.set(false); // Cerramos el menú desplegable
  }

  closeActionModal() {
    this.isActionModalOpen.set(false);
    this.selectedAction.set('');
  }

  saveAction() {
    // Aquí es donde llamarías a tu servicio (ej. this.http.post(...))
    console.log('Guardando acción:', this.selectedAction());
    console.log('Observación:', this.actionObservation());
    console.log('Usuario afectado:', this.solicitudSeleccionada());
    console.log('Solicitud id:', this.solicitudSeleccionada().id);

    // Opcional: podrías agregar la lógica aquí para actualizar el estado visualmente en la tabla

    // Al terminar, cerramos el modal
    this.closeActionModal();
  }

  // Método auxiliar para capturar lo que el usuario escribe en el textarea sin usar FormsModule
  updateObservation(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.actionObservation.set(textarea.value);
  }
}
