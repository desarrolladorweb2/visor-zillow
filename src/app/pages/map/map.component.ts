// import { Component, Input, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { NavbarComponent } from '../../components/home/navbar/navbar.component';
// import { SidebarComponent } from '../../components/home/sidebar/sidebar.component';
// import { FooterComponent } from '../../components/home/footer/footer.component';
// import { MapMainComponent } from '../../components/home/map-main/map-main.component';
// import { GeometryService } from '../../core/services/home/map/geometry.service';

// @Component({
//   selector: 'app-map',
//   imports: [
//     NavbarComponent,
//     SidebarComponent,
//     FooterComponent,
//     RouterOutlet,
//     MapMainComponent,
//   ],
//   templateUrl: './map.component.html',
//   styleUrl: './map.component.less',
// })
// export class MapComponent implements OnInit {

//   @Input() id?: string;

//   constructor(private readonly geometryService: GeometryService) {

//   }

//   ngOnInit() {
//     if (this.id) {
//       this.geometryService.setIdVisor(this.id);
//       console.log('id: ', this.id);
//     }
//   }

// }

import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  ngOnInit() {
    this.id = '1';
    this.geometryService.setIdVisor(this.id);
    this.loadProperties();
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

    // Actualizamos el signal de filtros
    this.filters.update(prev => ({ ...prev, [key]: value }));

    // Aquí disparas la recarga de datos con los nuevos filtros
    this.applyFilters();
  }

  applyFilters() {
    const currentFilters = this.filters();

    // 1. Tomamos SIEMPRE la data original e intacta como punto de partida
    // (Asegúrate de que property() tenga el array de resultados)
    const allData = this.property() || [];

    // 2. Filtramos la data original según lo que esté seleccionado
    const logicFiltered = allData.filter((item: any) => {
      return this.filterByPrice(item.valor_inmueble, currentFilters.valor_inmueble) &&
        this.filterByString(item.tipo_bien, currentFilters.tipo_bien) &&
        this.filterByString(item.clasificacion, currentFilters.clasificacion) &&
        this.filterByString(item.departamento, currentFilters.departamento) &&
        this.filterByString(item.municipio, currentFilters.municipio);
    });

    // 3. ACTUALIZAMOS LAS CARDS INMEDIATAMENTE
    // Esto es lo que tú mencionas: si no lo ponemos aquí, no se ve en la pantalla.
    this.filteredProperties.set(logicFiltered);
    this.totalCount.set(logicFiltered.length);

    // 4. Le pasamos esta nueva lista al mapa para que borre/dibuje los pines correctos
    if (this.mapComponent) {
      this.mapComponent.setFullData(logicFiltered);
    }
  }

  // Funciones auxiliares de filtrado
  private filterByPrice(itemPrice: number, filterValue: string): boolean {
    if (!filterValue) return true; // Si no hay filtro, pasa

    if (filterValue.includes('+')) {
      const min = parseInt(filterValue.replace('+', ''));
      return itemPrice >= min;
    }

    const [min, max] = filterValue.split('-').map(v => parseInt(v));
    return itemPrice >= min && itemPrice <= max;
  }

  private filterByString(itemValue: string, filterValue: string): boolean {
    if (!filterValue) return true; // Si el select está vacío (""), deja pasar el dato
    return itemValue?.toLowerCase() === filterValue.toLowerCase();
  }
}

