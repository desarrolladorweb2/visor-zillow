import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InfoInmuebleService } from '../../core/services/info-inmueble.service';
import { CommonModule } from '@angular/common';
import { DetalleListadoSolicitudesComponent } from "../detalle-listado-solicitudes/detalle-listado-solicitudes.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listado-solicitudes',
  imports: [CommonModule, DetalleListadoSolicitudesComponent, FormsModule],
  templateUrl: './listado-solicitudes.component.html',
  styleUrl: './listado-solicitudes.component.less'
})
export class ListadoSolicitudesComponent implements OnInit {

  private readonly infoInmuebleService = inject(InfoInmuebleService);

  // paginador
  currentPage = signal(1);
  pageSize = signal(5);

  // Calcula cuántas páginas hay en total basándose en los resultados filtrados
  totalPages = computed(() => {
    const total = this.filteredProperties().length;
    return Math.ceil(total / this.pageSize()) || 1; // Mínimo 1 página
  });

  // Este es el arreglo final que se va a pintar en el HTML (solo los de la página actual)
  paginatedProperties = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredProperties().slice(startIndex, endIndex);
  });

  // Lista de inmuebles para la tabla
  properties = signal<any[]>([]);

  inmuebleSeleccionadoDetalle = signal<any | null>(null);

  // Control del modal de solicitudes
  solicitudesActivas = signal<any[] | null>(null);
  inmuebleActivo = signal<any>(null);

  searchTerm = signal<string>('');

  filteredProperties = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.properties();

    return this.properties().filter(p =>
      p.direccion?.toLowerCase().includes(term) ||
      p.municipio?.toLowerCase().includes(term) ||
      p.tipo_bien?.toLowerCase().includes(term) ||
      p.tipo_predio?.toLowerCase().includes(term) ||
      p.departamento?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.infoInmuebleService.getProperties({}).subscribe({
      next: (res) => {
        const data = res.results.filter((item: any) => item.solicitado);
        this.properties.set(data);
      },
      error: (err) => console.error('Error cargando tabla:', err)
    });
  }

  // Se dispara al hacer clic en "Ver Solicitudes"
  abrirSolicitudes(inmueble: any) {
    this.inmuebleActivo.set(inmueble);
    // Si no tiene arreglo de solicitudes, mandamos uno vacío
    this.solicitudesActivas.set(inmueble.solicitudes || []);
  }

  cerrarModal() {
    this.solicitudesActivas.set(null);
    this.inmuebleActivo.set(null);
  }

  verDetalles(inmueble: any) {
    this.inmuebleSeleccionadoDetalle.set(inmueble);
  }

  // paginador
  actualizarBuscador(termino: string) {
    this.searchTerm.set(termino);
    this.currentPage.set(1); // Si busco algo nuevo, regreso a la página 1
  }

  // Métodos para los botones
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages()) {
      this.currentPage.set(pagina);
    }
  }

  // Crea un arreglo rápido para dibujar los botones numéricos [1, 2, 3...]
  get pagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}
