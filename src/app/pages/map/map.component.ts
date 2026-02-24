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

import { Component, OnInit, signal } from '@angular/core';
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
  filters = signal({
    precio: '',
    tipoBien: '',
    clasificacion: '',
    depto: '',
    municipio: ''
  });

  property = signal<any>({
    "metadata": {
      "total_results": 5,
      "bbox": [-121.95, 49.12, -121.85, 49.20],
      "zoom_level": 14
    },
    "results": [
      {
        "id": "R3092234",
        "solicitado": false,
        "valor_inmueble": 1349900,
        "tipo_bien": "Casa",
        "area_terreno": 100,
        "area_construida": 200,
        "tipo_predio": "rural",
        "clasificacion": "",
        "departamento": "Valle del Cauca",
        "municipio": "Cali",
        "direccion": "carrera 28 # 3-333",
        "barrio": "Santa Teresa",
        "estrato": "2",
        "coordinates": {
          "lat": 3.45961,
          "lng": -76.533085
        },
        "solicitado_por": "",
        "images": [
          "/assets/img/bien_id1_1.png",
          "/assets/img/bien_id1_2.png",
          "/assets/img/bien_id1_2.png",
          "/assets/img/bien_id1_1.png",
          "/assets/img/bien_id1_2.png",
          "/assets/img/bien_id1_2.png",
          "/assets/img/bien_id1_1.png",
          "/assets/img/bien_id1_2.png",
        ],
      },
      {
        "id": "R3092234",
        "solicitado": false,
        "valor_inmueble": 1349900,
        "tipo_bien": "Hotel",
        "area_terreno": 100,
        "area_construida": 200,
        "tipo_predio": "Urbano",
        "clasificacion": "Inmueble",
        "departamento": "Antioquia",
        "municipio": "Medellin",
        "direccion": "carrera 7A # 4-533",
        "barrio": "Poblado",
        "estrato": "2",
        "coordinates": {
          "lat": 6.259036,
          "lng": -75.586827
        },
        "solicitado_por": "",
        "images": [
          "/assets/img/bien_id2_1.png",
          "/assets/img/bien_id2_2.png",
          "/assets/img/bien_id2_2.png",
        ],
      },
      {
        "id": "R3092234",
        "solicitado": true,
        "valor_inmueble": 1349900,
        "tipo_bien": "Apartamento",
        "area_terreno": 72,
        "area_construida": 72,
        "tipo_predio": "Urbano",
        "clasificacion": "Inmueble",
        "departamento": "Antioquia",
        "municipio": "Medellin",
        "direccion": "Calle 79 No 72A 64",
        "barrio": "Laureles",
        "estrato": "4",
        "coordinates": {
          "lat": 6.27882,
          "lng": -75.58078
        },
        "solicitado_por": "Maria Juliana, Pepito Perez, Juan Perez",
        "images": [
          "/assets/img/bien_id3_1.png",
          "/assets/img/bien_id3_2.png",
          "/assets/img/bien_id3_1.png",
        ],
      },
      {
        "id": "R3092234",
        "solicitado": false,
        "valor_inmueble": 1349900,
        "tipo_bien": "Terreno",
        "area_terreno": 40050,
        "area_construida": 0,
        "tipo_predio": "Rural",
        "clasificacion": "Inmueble",
        "departamento": "Meta",
        "municipio": "Villavicencio",
        "direccion": "VILLA MORALIA",
        "barrio": "VILLA MORALIA",
        "estrato": "3",
        "coordinates": {
          "lat": 4.131045,
          "lng": -73.566847
        },
        "solicitado_por": "",
        "images": [
          "/assets/img/bien_id5_1.png",
          "/assets/img/bien_id5_2.png",
          "/assets/img/bien_id5_3.png",
        ],
      },
      {
        "id": "R3092234",
        "solicitado": false,
        "valor_inmueble": 1349900,
        "tipo_bien": "Hotel",
        "area_terreno": 40050,
        "area_construida": 0,
        "tipo_predio": "Rural",
        "clasificacion": "Inmueble",
        "departamento": "Meta",
        "municipio": "Villavicencio",
        "direccion": "EL POTRILLO Y LA POTRILLA",
        "barrio": "EL POTRILLO Y LA POTRILLA",
        "estrato": "3",
        "coordinates": {
          "lat": 4.131045,
          "lng": -73.566847
        },
        "solicitado_por": "",
        "images": [
          "/assets/img/bien_id1_1.png",
          " /assets/img/bien_id1_2.png",
        ],
        "status_tag": "New Construction"
      }
    ]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly geometryService: GeometryService
  ) { }

  ngOnInit() {
    this.id = '1';
    this.geometryService.setIdVisor(this.id);
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
    console.log('Aplicando filtros:', currentFilters);

    // Lógica para llamar a tu geometryService o API enviando estos valores
    // this.geometryService.search(currentFilters);
  }
}

