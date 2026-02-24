import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../core/services/shared/dialog.service';
import { SearcherSidebarService } from '../../../core/services/widget/searcher-sidebar.service';
import { infoSeacher } from '../../../interfaces/info-searcher';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SearchCriteria } from '../../../interfaces/search-criteria';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import L from 'leaflet';
import { MapService } from '../../../core/services/home/map/map.service';
import { ContactCardComponent } from '../contact-card/contact-card.component';
import { LocationService } from '../../../core/services/home/map/location.service';
import { LayersService } from '../../../core/services/home/map/layers.service';

@Component({
  standalone: true,
  selector: 'app-searcher-sidebar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSliderModule],
  templateUrl: './searcher-sidebar.component.html',
  styleUrl: './searcher-sidebar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearcherSidebarComponent implements OnInit {
  readonly DEFAULT_LABEL = 'Circulo Registral';

  optionSearch: SearchCriteria[] = [];
  isVisible: boolean = false;
  selectedOption: string = this.DEFAULT_LABEL;
  selectedCirculo: string = '';
  placeholderText = '';
  infoInput = '';
  dataFilter?: SearchCriteria;
  showError: boolean = false;
  showErrorNoFound: boolean = false;

  minValue: number = 0;
  maxValue: number = 0;
  initialMinValue: number = 0;
  initialMaxValue: number = 0;

  options: any = {
    floor: 0,
    ceil: 10000000,
    step: 100,
    translate: (value: number): string => {
      return `$ ${value.toLocaleString('es-CO')}`;
    },
    // translate: (value: number): string => {
    //   return value + '$';
    // },
  };

  infoSeacher$!: Observable<infoSeacher[]>;

  private map!: L.Map;
  private geoJSONlayer: L.GeoJSON | null = null;
  private highlight: L.GeoJSON | null = null;
  private init: any;
  private coords: any = [];
  private idSearchLayer: any | null = null;
  @Input() data$: BehaviorSubject<any> = new BehaviorSubject(null);
  idVisor: any;
  idEntidad: any;

  private readonly selectedLayer: L.GeoJSON = L.geoJSON(null, {
    style: {
      color: '#30fcfc',
      weight: 1,
      fillColor: '#30fcfc',
      fillOpacity: 0.3,
    },
  });

  constructor(
    private readonly searcherSidebarService: SearcherSidebarService,
    private readonly dialogService: DialogService,
    private readonly mapSvc: MapService,
    private readonly locationSvc: LocationService,
    private readonly layersService: LayersService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idVisor = this.data$.value._value;
    //console.log('Id Visor=> ', this.idVisor)
    this.getSearchCriteria();
    this.minValue = 1000; // ej: 200
    this.maxValue = 10000000; // ej: 800
    this.initialMinValue = 1000; // ej: 200
    this.initialMaxValue = 10000000; // ej: 800
    this.map = this.mapSvc.getMap();
    this.init = this.locationSvc.getLocationInitial();
    this.coords = this.init.location as [number, number];

    this.searcherSidebarService.condicionBusqueda$.subscribe((condicion) => {
      if (condicion) {
        this.selectedOption = condicion;
      }
    });

    this.searcherSidebarService.valorStringBuscado$.subscribe((valor) => {
      if (typeof valor === 'string' && valor != '') {
        this.infoInput = valor;
      }
    });

    this.mapSvc.geoJSONLayerFiltro$.subscribe((layer) => {
      if (layer) {
        this.geoJSONlayer = layer;
      }
    });
    const highlight = this.mapSvc.getHighlight();
    if (highlight && this.map.hasLayer(highlight)) {
      this.map.removeLayer(highlight);
    }
  }

  // ngOnDestroy(): void {
  //   // Unsubscribe from all subscriptions at once when the component is destroyed
  //   this.subscriptions.unsubscribe();
  //   // Also, remember to clear the Leaflet layers
  //   if (this.geoJSONlayer) {
  //     this.map.removeLayer(this.geoJSONlayer);
  //   }
  //   if (this.highlight && this.map.hasLayer(this.highlight)) {
  //     this.map.removeLayer(this.highlight);
  //   }
  // }

  getSearchCriteria(): void {
    this.searcherSidebarService.getSearchCriteria().subscribe({
      next: (resp) => {
        console.log('Opciones Búsqueda =>', resp)
        this.optionSearch = resp.data ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.optionSearch = [];
      },
    });
  }

  clickSearcher(): void {
    this.isVisible = !this.isVisible;
  }

  selectOption(option: string, name: string) {
    this.selectedCirculo = option;
    this.selectedOption = name;
    this.isVisible = false;
    this.infoInput = "";
  }

  get displayIcon() {
    return this.isVisible ? 'display_down.svg' : 'display_up.svg';
  }

  private clearLastSearch() {
    const layer = this.layersService.getLayerObject('cr_terrenos', Number(this.idSearchLayer));
    const key = `${'cr_terrenos'}-${this.idSearchLayer}`;
    if (layer) {
      this.map.removeLayer(layer);
      this.dialogService.closeByKey(key);
      this.layersService.decrement();
      this.layersService.removeLayerId('cr_terrenos', Number(this.idSearchLayer));
    }
    this.idSearchLayer = null;
  }  

  async searchInformation(): Promise<void> {
    if(this.idSearchLayer){
      this.clearLastSearch()
    }

    this.showErrorNoFound = false;
    this.showError = false;

    // Validación de longitud
    // if (this.infoInput.length !== 30) {
    //   this.showError = true;
    //   return;
    // }
    if (this.infoInput.length < 1) {
      this.showError = true;
      return;
    }
  
    // Obtener ID
    const idSearchLayer = await this.getIdSearchLayer(); 
    //console.log('idSearchLayer =>', idSearchLayer)
  
    if (!idSearchLayer) {
      this.showErrorNoFound = true;
      this.cdr.markForCheck();
      this.map.setView(this.coords, this.init.zoom);
      return;
    }
  
    this.idSearchLayer = idSearchLayer;
    //const layerName = 'cr_terrenos';
    const layerName = 'ubicacion';
    const geoLayer = this.mapSvc.getGeoJSONLayer() as L.GeoJSON;
  
    if (!geoLayer) {
      console.warn(`No se encontró la capa ${layerName} en el mapa`);
      this.showErrorNoFound = true;
      return;
    }
  
    let foundFeature: any = null;
  
    geoLayer.eachLayer((layer: any) => {
      const props = layer.feature?.properties;
      const id = props?.predio_id || props?.id_dato_seccion || props?.fichaconstrudetalle_id  || props?.ubicacion_id;
  
      if (id == idSearchLayer) {
        foundFeature = layer.feature;
      }
    });
  
    // Si no encuentra feature
    if (!foundFeature) {
      this.showErrorNoFound = true;
      this.cdr.markForCheck();
      return;
    }
  
    // (procedimiento normal si hay match)

    const layer = this.layersService.getLayerObject(layerName, Number(idSearchLayer));
    
    const key = `${layerName}-${idSearchLayer}`;
    if (layer) {
      this.map.removeLayer(layer);
      this.dialogService.closeByKey(key);
      this.layersService.decrement();
      this.layersService.removeLayerId(layerName, Number(idSearchLayer));
    }

    //if (this.highlight) {
    //  this.map.removeLayer(this.highlight);
    //}
  
    //this.addToSelection(foundFeature);
    
    const counter = this.layersService.increment();
    this.highlight = L.geoJSON(foundFeature, {
      style: (f) => {
        return {
          color: '#b91515ff',
          weight: 1,
          fillColor: '#b41a1aff',
          fillOpacity: 0.3,
        };
      },
    
      pointToLayer: (f, latlng) => {
        const geomType = f.geometry?.type;              
        if (geomType === 'Point' || geomType === 'MultiPoint') {
          const myIcon = L.icon({
            iconUrl: 'assets/icon/ubicacion.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          return L.marker(latlng, { icon: myIcon });
        }
        return L.marker(latlng);
      }
    }).addTo(this.map);
    const latlng = this.highlight.getBounds().getCenter();

    this.map.flyTo(latlng, 18, {
      animate: true,
      duration: 0.5
    });
  
    const entidad = this.entidadId(this.idVisor);
    this.layersService.addLayerId(layerName, Number(idSearchLayer), this.highlight);
    const selectedFeatureData = { id: idSearchLayer, layerName, counter, idVisor: this.idVisor, entidad };
    this.dialogService.openRefer(
      {
        component: ContactCardComponent,
        data: selectedFeatureData,
      },
      key
    );
  }

  private addToSelection(feature: any) {
    this.selectedLayer.addData(feature);
  }

  async getIdSearchLayer(): Promise<any | null> {
    try {
      const entidad = this.entidadId(this.idVisor);
      const resp = await lastValueFrom(
        //this.searcherSidebarService.getIdPredioByNPN(this.infoInput, entidad, this.idVisor)
        this.searcherSidebarService.getIdUbicacionByMatricula(this.infoInput, this.selectedCirculo)
      );

      if (resp.status === 'success') {
        console.log('Retorno de backend búsqueda =>', resp)
        //return resp.data.predio_id;
        return resp.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el ID del predio:', error);
      return null;
    }
  }

  clearInformation(): void {
    this.showError = false;
    this.showErrorNoFound = false;

    this.infoSeacher$ = new Observable<infoSeacher[]>((obs) => obs.next([]));
    this.placeholderText = '';
    this.selectedOption = this.DEFAULT_LABEL;
    this.mapSvc.setDataFiltradaWFS([]);
    this.searcherSidebarService.setValorStringBuscado('');
    this.searcherSidebarService.setCondicionBusqueda('');
    this.infoInput = '';
    this.resetRange();
    this.map.setView(this.coords, this.init.zoom);
    
    if(this.idSearchLayer){
      this.clearLastSearch()
    }

    //if (this.geoJSONlayer) {
    //  this.map.removeLayer(this.geoJSONlayer);
    //  this.map.addLayer(this.mapSvc.getGeoJSONLayer());
    //  this.geoJSONlayer = null;
    //}
    //const highlight = this.mapSvc.getHighlight();
    //if (highlight && this.map.hasLayer(highlight)) {
    //  this.map.removeLayer(highlight);
    //}
  }

  resetRange() {
    this.minValue = this.initialMinValue;
    this.maxValue = this.initialMaxValue;
  }

  trackByAcreditado(_: number, item: infoSeacher): string {
    return item.AcreditadoNum;
  }

  entidadId(id: any): any {
    const mapping: Record<any, any> = {
      1: 2,
      2: 3,
      3: 2,
      4: 3
    };
    return mapping[id] ?? null; // o cualquier valor por defecto
  }  

  onInputChange(event: any) {
    this.showErrorNoFound = false;
    this.showError = false;
    this.cdr.markForCheck();
  }
}
