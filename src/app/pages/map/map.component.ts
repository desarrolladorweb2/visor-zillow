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

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    RouterOutlet,
    MapMainComponent,
    ContainerCardComponent
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
        "price": 1349900,
        "currency": "CAD",
        "beds": 5,
        "baths": 4,
        "sqft": 3544,
        "property_type": "House for sale",
        "address": "6080 Ross Rd, Chilliwack, BC V2R 4S6",
        "time_ago": "20 hours ago",
        "agency": "CENTURY 21 CREEKSIDE REALTY",
        "is_favorite": false,
        "coordinates": {
          "lat": 49.152,
          "lng": -121.912
        },
        "images": [
          "/assets/img/bien_id1_1.png",
          "/assets/img/bien_id1_2.png",
        ],
        "status_tag": "New Construction"
      },
      {
        "id": "R3092234",
        "price": 1349900,
        "currency": "CAD",
        "beds": 5,
        "baths": 4,
        "sqft": 3544,
        "property_type": "House for sale",
        "address": "6080 Ross Rd, Chilliwack, BC V2R 4S6",
        "time_ago": "20 hours ago",
        "agency": "CENTURY 21 CREEKSIDE REALTY",
        "is_favorite": false,
        "coordinates": {
          "lat": 49.152,
          "lng": -121.912
        },
        "images": [
          "src/assets/img/bien_id2_1.png",
          "src/assets/img/bien_id2_2.png",
          "src/assets/img/bien_id2_2.png",
        ],
        "status_tag": "New Construction"
      },
      {
        "id": "R3092234",
        "price": 1349900,
        "currency": "CAD",
        "beds": 5,
        "baths": 4,
        "sqft": 3544,
        "property_type": "House for sale",
        "address": "6080 Ross Rd, Chilliwack, BC V2R 4S6",
        "time_ago": "20 hours ago",
        "agency": "CENTURY 21 CREEKSIDE REALTY",
        "is_favorite": false,
        "coordinates": {
          "lat": 49.152,
          "lng": -121.912
        },
        "images": [
          "src/assets/img/bien_id3_1.png",
          "src/assets/img/bien_id3_2.png",
          "src/assets/img/bien_id3_1.png",
        ],
        "status_tag": "New Construction"
      },
      {
        "id": "R3092234",
        "price": 1349900,
        "currency": "CAD",
        "beds": 5,
        "baths": 4,
        "sqft": 3544,
        "property_type": "House for sale",
        "address": "6080 Ross Rd, Chilliwack, BC V2R 4S6",
        "time_ago": "20 hours ago",
        "agency": "CENTURY 21 CREEKSIDE REALTY",
        "is_favorite": false,
        "coordinates": {
          "lat": 49.152,
          "lng": -121.912
        },
        "images": [
          "src/assets/img/bien_id5_1.png",
          "src/assets/img/bien_id5_2.png",
          "src/assets/img/bien_id5_3.png",
        ],
        "status_tag": "New Construction"
      },
      {
        "id": "R3092234",
        "price": 1349900,
        "currency": "CAD",
        "beds": 5,
        "baths": 4,
        "sqft": 3544,
        "property_type": "House for sale",
        "address": "6080 Ross Rd, Chilliwack, BC V2R 4S6",
        "time_ago": "20 hours ago",
        "agency": "CENTURY 21 CREEKSIDE REALTY",
        "is_favorite": false,
        "coordinates": {
          "lat": 49.152,
          "lng": -121.912
        },
        "images": [
          "src/assets/img/bien_id1_1.png",
          "src/assets/img/bien_id1_2.png",
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

