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
    tipo_bien_id: null,
    tipo_predio_id: null,
    clasificacion_id: null,
    departamento_id: null,
    municipio_id: null
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
    let newList = [...properties];
    const currentSelectedId = this.selectedPropertyId();

    // Si hay un elemento seleccionado, garantizamos que se quede de primero
    if (currentSelectedId) {
      const selectedIndex = newList.findIndex((item: any) => item.id === currentSelectedId);

      if (selectedIndex > 0) {
        // Lo cortamos de su posición actual y lo ponemos al inicio
        const [selectedItem] = newList.splice(selectedIndex, 1);
        newList.unshift(selectedItem);
      }
    }

    this.filteredProperties.set(newList);
    this.totalCount.set(newList.length);
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
        this.filterByID(Number(item.tipo_bien_id), Number(currentFilters.tipo_bien_id)) &&
        this.filterByID(Number(item.tipo_predio_id), Number(currentFilters.tipo_predio_id)) &&
        this.filterByID(Number(item.clasificacion_id), Number(currentFilters.clasificacion_id)) &&
        this.filterByID(Number(item.departamento_id), Number(currentFilters.departamento_id)) &&
        this.filterByID(Number(item.municipio_id), Number(currentFilters.municipio_id));
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

  private filterByID(itemValue: number, filterValue: number): boolean {
    if (!filterValue) return true; // Si el select está vacío (""), deja pasar el dato
    return itemValue === filterValue;
  }

  // ARREGLOS DE DATOS PARA LOS FILTROS
  filterOptions = {
    precios: [
      { value: '0-500000', label: 'Hasta $500k' },
      { value: '500000-1000000', label: '$500k - $1M' },
      { value: '1000000-10000000', label: '$1M-10M' },
      { value: '10000000-50000000', label: '$10M-50M' },
      { value: '50000000-100000000', label: '$50M-100M' },
      { value: '100000000+', label: '$100M+' }
    ],
    tiposBien: [
      { id: 1, label: 'Casa' },
      { id: 3, label: 'Apartamento' },
      { id: 2, label: 'Hotel' },
      { id: 4, label: 'Terreno' },
      { id: 5, label: 'Oficina' }
    ],
    tiposPredio: [
      { id: 1, label: 'Rural' },
      { id: 2, label: 'Urbano' }
    ],
    clasificaciones: [
      { id: 1, label: 'clasificacion1' },
      { id: 2, label: 'Inmueble' }
    ],
    departamentos: [
      { id: 1, label: 'Valle del Cauca' },
      { id: 2, label: 'Antioquia' },
      { id: 4, label: 'Meta' },
      { id: 5, label: 'Bolívar' },
      { id: 6, label: 'Cundinamarca' },
      { id: 7, label: 'Nariño' }
    ],
    municipios: [
      { id: 1, label: 'Cali' },
      { id: 2, label: 'Medellin' },
      { id: 4, label: 'Villavicencio' },
      { id: 5, label: 'Barranquilla' },
      { id: 6, label: 'Bogotá' },
      { id: 7, label: 'Pasto' }
    ]
  }
}

