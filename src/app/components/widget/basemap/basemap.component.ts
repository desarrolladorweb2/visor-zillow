import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Basemap } from '../../../interfaces/basemap';
import { BasemapService } from '../../../core/services/widget/basemap.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeBasemapService } from '../../../core/services/widget/change-basemap.service';
import { Observable, of } from 'rxjs';
import { MapService } from '../../../core/services/home/map/map.service';
import { Subscription } from 'rxjs';
import { EstadoService } from '../../../core/services/observables.service';
import { GeometryService } from '../../../core/services/home/map/geometry.service';

@Component({
  selector: 'app-basemap',
  imports: [CommonModule, FormsModule],
  templateUrl: './basemap.component.html',
  styleUrl: './basemap.component.less',
})
export class BasemapComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() hideToolbarVertical = new EventEmitter<boolean>();
  //isDisponible$: Observable<boolean> = of(false);
  isDisponible: boolean = false;

  activeIndex: number | null = null;
  mapDefault: Basemap[] = [];

  isSmallScreen: boolean = false;
  basemapWidth: number = 150;
  borderWidth: number = 4;
  startIndex = 0;
  visibleCount = 4;
  menuOpen = false;
  ref: any; // Reference for the dialog
  highlightedMapId: number | null = null;

  selectedBaseOption: string = '';
  zoom: number = 0;
  map: any;

  private currentWmsLayer: any = null;
  private subscripcion: Subscription = new Subscription();
  private readonly baseMapP = { id: 1, mapa: 'satelital', label: 'Satelital', url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x.png', predefinido: true, subdomains: [], maxar: false, atribucion: '© OpenStreetMap contributors' }
  private readonly baseMapI = { id: 1, mapa: 'infrarrojo', label: 'Infrarrojo', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', predefinido: true, subdomains: ['a', 'b', 'c'], maxar: false, atribucion: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)' }
  //private readonly baseMapI = { id: 1, mapa: 'infrarrojo', label: 'Infrarrojo', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', predefinido: false, subdomains: ['a', 'b', 'c', 'd'], maxar: false, atribucion: '© OpenStreetMap contributors © CARTO' }

  constructor(
    private readonly basemapService: BasemapService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly changeBasemapService: ChangeBasemapService,
    private readonly mapService: MapService,
    private estadoService: EstadoService,
    private geometryService: GeometryService) {
    //this.isDisponible$ = of(false);
  }
  ngAfterViewInit(): void {

  }

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isSmallScreen = result.matches;
        this.basemapWidth = this.isSmallScreen ? 80 : 90;
        this.borderWidth = this.isSmallScreen ? 2 : 4;
      });

    this.setVisibleCountByScreenSize();

    // Ajustar al cambiar tamaño de pantalla
    window.addEventListener('resize', this.onResize, { passive: true });
    this.getIcons();

    this.subscripcion = this.estadoService.zoomActual$.subscribe(valor => {
      this.zoom = valor;
      console.log(this.visibleMaps[0])
      if (this.zoom > 16 && !this.isDisponible) {
        this.isDisponible = true;
      } else if (this.zoom < 16 && this.isDisponible) {
        if (this.map.hasLayer(this.currentWmsLayer)) {
          this.map.removeLayer(this.currentWmsLayer);
          this.currentWmsLayer = null;
          console.log('Capa anterior eliminada');
        }
        //this.map = null;
        this.isDisponible = false;
        this.menuOpen = false;
        this.setBaseMap(this.baseMapP);
        this.hiddenBarToolVertical();
        this.selectedBaseOption = '';
        this.hideToolbarVertical.emit(true);
        console.log('Default Mapa:', this.mapDefault);

        this.changeBasemapService.updateBasemap({
          url: this.baseMapP.url,
          subdomains: this.baseMapP.subdomains || [],
          atribucion: this.baseMapP.atribucion || '',
        });
      }
      console.log('Componente actualizado con:', valor);
    });

  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.setVisibleCountByScreenSize();
  };

  getIcons(): void {
    this.mapDefault = this.basemapService.getBasemaps();
  }

  private setVisibleCountByScreenSize(): void {
    const width = window.innerWidth;

    if (width < 576) {
      // móviles pequeños
      this.visibleCount = 1;
    } else if (width < 768) {
      // móviles grandes / tablets pequeñas
      this.visibleCount = 2;
    } else if (width < 992) {
      // tablets
      this.visibleCount = 3;
    } else if (width < 1200) {
      // pantallas medianas
      this.visibleCount = 4;
    } else {
      // pantallas grandes
      this.visibleCount = 5;
    }
  }

  get visibleMaps() {
    return this.mapDefault.slice(
      this.startIndex,
      this.startIndex + this.visibleCount
    );
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.startIndex = 0; // resetea siempre al abrir

    this.menuOpen ? this.hideToolbarVertical.emit(false) : this.hideToolbarVertical.emit(true);
  }

  scrollUp(): void {
    if (this.startIndex > 0) {
      this.startIndex--;
    }
  }

  scrollDown(): void {
    if (this.startIndex + this.visibleCount < this.mapDefault.length - 1) {
      this.startIndex++;
    }
  }

  setBaseMap(imgParam: Basemap): void {
    this.menuOpen = false;

    this.mapDefault = this.mapDefault.map((img) => ({
      ...img,
      predefinido: img.id === imgParam.id,
    }));
  }

  getPredefinedMap(): Basemap | undefined {
    return this.mapDefault.find((m) => m.predefinido);
  }

  async doOption(type: string, img: Basemap) {
    if (!this.isDisponible) {
      //console.log('Retornando=>')
      return;
    }

    if (this.map && this.currentWmsLayer) {
      if (this.map.hasLayer(this.currentWmsLayer)) {
        this.map.removeLayer(this.currentWmsLayer);
        this.currentWmsLayer = null;
        console.log('Capa anterior eliminada');
      }
    }

    this.selectedBaseOption = type;
    if (type === 'free') {
      this.menuOpen = false;
      this.setBaseMap(img);
      this.hiddenBarToolVertical();
      this.hideToolbarVertical.emit(true); //  muestra cuando se cierra

      this.changeBasemapService.updateBasemap({
        url: img.url,
        subdomains: img.subdomains || [],
        atribucion: img.atribucion || '',
      });
    } else if (type === 'mosaico' || type === 'stream15' || type === 'stream30') {
      let productName = '';
      switch (type) {
        case 'stream15':
          productName = 'VIVID_ADVANCED_15';
          break;
        case 'stream30':
          productName = 'VIVID_STANDARD_30';
          break;
        case 'mosaico':
          productName = 'DAILY_TAKE';
          break;
      }
      const isVivid = productName.includes('VIVID');
      const apiKey = "YzJjNDFhMDItY2ZiOS00ZDY3LWE5MGQtZjRhY2E2NzVlOGI2";
      const url = isVivid
        ? `https://api.maxar.com/basemaps/v1/ogc/gwc/service/wmts?Service=WMTS&Request=GetTile&Version=1.0.0&layer=Maxar:Imagery&style=raster&tilematrixset=EPSG:3857&TileMatrix=EPSG:3857:{z}&TileCol={x}&TileRow={y}&Format=image/jpeg&cql_filter=productName='${productName}'&maxar_api_key=${apiKey}`
        : `https://api.maxar.com/streaming/v1/ogc/gwc/service/wmts?Service=WMTS&Request=GetTile&Version=1.0.0&layer=Maxar:Imagery&style=raster&tilematrixset=EPSG:3857&TileMatrix=EPSG:3857:{z}&TileCol={x}&TileRow={y}&Format=image/png&cql_filter=productName='${productName}'&maxar_api_key=${apiKey}`;

      this.changeBasemapService.updateBasemap({
        url: url,
        subdomains: [],
        atribucion: '© Maxar Technologies',
      });

      this.setBaseMap(img);
      this.hiddenBarToolVertical();
      this.hideToolbarVertical.emit(true);
    } else if (type === 'infrarrojo') {
      this.map = this.mapService.getMap();
      if (this.map) {
        const data = await this.geometryService.getLayerWMS('Observatorio_Inmobiliario', 'infrarrojo');
        //const data = await this.geometryService.getLayerWMS('Sahagun', 'sahagun');
        if (data) {
          this.currentWmsLayer = data;
          this.currentWmsLayer.addTo(this.map);
          console.log('Nueva capa añadida', data);
        }
      }

      // this.changeBasemapService.updateBasemap({
      //   url: this.baseMapI.url,
      //   subdomains: this.baseMapI.subdomains || [],
      //   atribucion: this.baseMapI.atribucion || '',
      // });

      // this.setBaseMap(this.baseMapI);
      // this.hiddenBarToolVertical();
      // this.hideToolbarVertical.emit(true);
    }
    else {
      this.selectedBaseOption = '';
      this.highlightedMapId = img.id;
      setTimeout(() => {
        this.highlightedMapId = null;
      }, 6000);
    }
  }

  getOptionLabel(option: string): string {
    switch (option) {
      case 'stream15':
        return 'Streaming 15cm';
      case 'stream30':
        return 'Streaming 30cm';
      case 'mosaico':
        return 'Mosaico Estándar';
      case 'infrarrojo':
        return 'Mosaico Infrarrojo';
      default:
        return '';
    }
  }

  hiddenBarToolVertical() {
    this.hideToolbarVertical.emit();
  }

}
