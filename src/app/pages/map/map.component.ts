import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/home/navbar/navbar.component';
import { SidebarComponent } from '../../components/home/sidebar/sidebar.component';
import { FooterComponent } from '../../components/home/footer/footer.component';
import { MapMainComponent } from '../../components/home/map-main/map-main.component';
import { GeometryService } from '../../core/services/home/map/geometry.service';
import { ContainerCardComponent } from "../../components/container-card/container-card.component";
import { CommonModule } from '@angular/common';
import { ContainerModalCardComponent } from "../../components/container-modal-card/container-modal-card.component";
import { ContainerModalContactCardComponent } from "../../components/container-modal-contact-card/container-modal-contact-card.component";
import { InfoInmuebleService } from '../../core/services/info-inmueble.service';

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    RouterOutlet,
    MapMainComponent,
    ContainerCardComponent,
    ContainerModalCardComponent,
    ContainerModalContactCardComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.less',
})
export class MapComponent implements OnInit {

  id?: string;
  isLoading = signal(false);
  filters = signal({
    valor_inmueble: '',
    tipo_bien: '',
    clasificacion: '',
    departamento: '',
    municipio: ''
  });

  property = signal<any>(null);
  filteredProperties = signal<any[]>([]);
  totalCount = signal(0);
  @ViewChild('mapRef') mapComponent!: MapMainComponent;

  private readonly infoInmuebleService = inject(InfoInmuebleService);
  private readonly geometryService = inject(GeometryService);
  selectedPropertyId = this.infoInmuebleService.selectedPropertyId;

  ngOnInit() {
    this.id = '1';
    this.geometryService.setIdVisor(this.id);
    this.loadProperties();

    this.infoInmuebleService.propertyUpdated$.subscribe((updatedProp) => {

      // 1. Actualizamos la data maestra (this.property())
      const allData = this.property() || [];
      const indexMaster = allData.findIndex((p: any) => p.id === updatedProp.id);
      if (indexMaster !== -1) {
        allData[indexMaster] = updatedProp;
        this.property.set([...allData]);
      }

      // 2. Actualizamos la data visual actual (las cards filtradas)
      const visibleData = this.filteredProperties();
      const indexFiltered = visibleData.findIndex((p: any) => p.id === updatedProp.id);
      if (indexFiltered !== -1) {
        visibleData[indexFiltered] = updatedProp;
        this.filteredProperties.set([...visibleData]);
      }

    });
  }

  loadProperties() {
    this.isLoading.set(true);

    this.infoInmuebleService.getProperties(this.filters()).subscribe({
      next: (data) => {
        // Guardamos el array completo en la data original
        const arrayData = data.results || [];
        this.property.set(arrayData);

        // Lo mostramos en las cards la primera vez
        this.filteredProperties.set(arrayData);
        this.totalCount.set(arrayData.length);
        this.isLoading.set(false);

        if (this.mapComponent) {
          this.mapComponent.setFullData(arrayData);
        }
      },
      error: (err) => {
        console.error('Error cargando propiedades', err);
        this.isLoading.set(false);
      }
    });
  }

  // Se ejecuta cada vez que el mapa se mueve (o cuando llegan datos nuevos)
  updateListFromMap(properties: any[]) {
    this.filteredProperties.set(properties);
    this.totalCount.set(properties.length);
  }

  updateFilter(key: string, event: any) {
    const value = (event.target as HTMLSelectElement).value;
    this.filters.update(prev => ({ ...prev, [key]: value }));
    this.applyFilters();
  }

  // Recibe el clic del mapa
  onPropertySelected(id: string) {
    // Encendemos la iluminación usando el servicio
    this.infoInmuebleService.selectedPropertyId.set(id);

    const currentList = [...this.filteredProperties()];
    const index = currentList.findIndex((item: any) => item.id === id);

    if (index > 0) {
      // Movemos el elemento al principio del array
      const [selectedItem] = currentList.splice(index, 1);
      currentList.unshift(selectedItem);

      this.filteredProperties.set(currentList);
    }

    // Hacemos scroll suave hacia arriba en el panel de resultados
    const panel = document.querySelector('.results-grid');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** FILTROS */

  applyFilters() {
    const currentFilters = this.filters();
    const allData = this.property() || [];

    const logicFiltered = allData.filter((item: any) => {
      return this.filterByPrice(item.valor_inmueble, currentFilters.valor_inmueble) &&
        this.filterByString(item.tipo_bien, currentFilters.tipo_bien) &&
        this.filterByString(item.clasificacion, currentFilters.clasificacion) &&
        this.filterByString(item.departamento, currentFilters.departamento) &&
        this.filterByString(item.municipio, currentFilters.municipio);
    });

    this.filteredProperties.set(logicFiltered);
    this.totalCount.set(logicFiltered.length);

    if (this.mapComponent) {
      this.mapComponent.setFullData(logicFiltered);
      this.mapComponent.focusOnData(logicFiltered);
    }
  }

  private filterByPrice(itemPrice: number, filterValue: string): boolean {
    if (!filterValue) return true;

    if (filterValue.includes('+')) {
      const min = Number(filterValue.replace('+', ''));
      return itemPrice >= min;
    }

    const [min, max] = filterValue.split('-').map(v => Number(v));
    return itemPrice >= min && itemPrice <= max;
  }

  private filterByString(itemValue: string, filterValue: string): boolean {
    if (!filterValue) return true; // Si el select está vacío (""), deja pasar el dato
    return itemValue?.toLowerCase() === filterValue.toLowerCase();
  }
}

