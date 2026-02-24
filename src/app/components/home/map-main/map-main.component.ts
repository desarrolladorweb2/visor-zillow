import L from 'leaflet';
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import 'leaflet.markercluster';
import 'leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js';

import { CommonModule } from '@angular/common';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { ToolbarComponent } from '../../widget/toolbar/toolbar.component';
import { ToolbarMapVerticalComponent } from '../../widget/toolbar-map-vertical/toolbar-map-vertical.component';
import { StatisticsComponent } from '../../widget/statistics/statistics.component';
import { ContactCardComponent } from '../../widget/contact-card/contact-card.component';
import { BasemapComponent } from '../../widget/basemap/basemap.component';

import { GeometryService } from '../../../core/services/home/map/geometry.service';
import { LocationService } from '../../../core/services/home/map/location.service';
import { MapService } from '../../../core/services/home/map/map.service';
import { DialogService } from '../../../core/services/shared/dialog.service';
import { StatsToggleService } from '../../../core/services/widget/stats-toggle.service';
import { ChangeBasemapService } from '../../../core/services/widget/change-basemap.service';
import 'proj4';
import 'proj4leaflet';
import { LayersService } from '../../../core/services/home/map/layers.service';

import { Input } from '@angular/core';
import { EstadoService } from '../../../core/services/observables.service';

@Component({
  standalone: true,
  selector: 'app-map-main',
  imports: [
    CommonModule,
    ToolbarComponent,
    ToolbarMapVerticalComponent,
    StatisticsComponent,
    BasemapComponent
  ],
  templateUrl: './map-main.component.html',
  styleUrls: ['./map-main.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapMainComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() idVisor!: string;
  @ViewChild('stats', { read: ElementRef, static: false })
  private readonly statsRef!: ElementRef<HTMLElement>;

  private map!: L.Map;
  private readonly plainLayer!: L.FeatureGroup<L.CircleMarker>;
  private readonly markerCluster!: L.MarkerClusterGroup;
  private readonly wmsLayers: L.TileLayer.WMS[] = [];
  private readonly destroy$ = new Subject<void>();
  private tileLayer!: L.TileLayer | null;
  private highlight: L.GeoJSON | null = null;

  // Estado de marcado y zoom
  lastMarker?: L.CircleMarker | null = null;
  markMode = false;
  zoomLevel = 8;
  showToolbarVertical: boolean = true;

  // Estadísticas & toolbar
  showStatistics = false;
  toolbarLeftPx = 0;
  toolbarRightPx = 0;
  readonly statisticsHeight = 90;
  readonly toolbarOffset = 10;
  readonly toolbarOffset2 = 20;
  private readonly baseMapUrl =
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  private baseMap = this.baseMapUrl;
  private layerControl!: L.Control.Layers;

  crs9377 = new (L as any).Proj.CRS(
    'EPSG:9377',
    '+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      resolutions: [
        8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1,
      ],
      origin: [0, 0],
    }
  );

  private readonly interactiveLayerMap = new Map<string, L.Layer>();
  private readonly selectedLayer: L.GeoJSON = L.geoJSON(null, {
    style: {
      color: '#30fcfc',
      weight: 1,
      fillColor: '#30fcfc',
      fillOpacity: 0.3,
    },
  });

  private readonly visorMap = new Map<string, { workspace: string; centroide: string; entidad: string }>([
    ['1', { workspace: 'POC_Realasset', centroide: 'centroide_banistmo', entidad: '2' }],
    ['2', { workspace: 'Geovisor-Cajica', centroide: 'centroide_cajica', entidad: '3' }],
    ['3', { workspace: 'Ofertas_Zipaquira', centroide: 'centroide_zipaquira', entidad: '2' }],
    ['4', { workspace: 'Ofertas_Cajica', centroide: 'centroide_cajica', entidad: '3' }]
  ]);
  featureAux: any | null;

  private readonly baseMapP = { id: 1, mapa: 'cartografico', label: 'Estándar', url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x.png', predefinido: true, subdomains: [], maxar: false, atribucion: '© OpenStreetMap contributors' }

  constructor(
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef,
    private readonly locationSvc: LocationService,
    private readonly geometrySvc: GeometryService,
    private readonly mapSvc: MapService,
    private readonly statsToggle: StatsToggleService,
    private readonly dialogService: DialogService,
    private readonly changeBasemapService: ChangeBasemapService,
    private readonly layersService: LayersService,
    private estadoService: EstadoService
  ) { }

  ngOnInit(): void {
    //console.log('Parámetro recibido:', this.idVisor);
    //this.loadWFSterrenos(this.idVisor);
    this.loadWFSubicaciones(this.idVisor);
    this.changeBasemapService.basemap$.subscribe((basemap) => {
      this.baseMap = basemap.url ?? this.baseMapUrl;
      const subdomains = basemap.subdomains;
      const atribucion = basemap.atribucion;

      if (this.tileLayer && this.map) {
        this.map.removeLayer(this.tileLayer);
        this.tileLayer = L.tileLayer(this.baseMap, {
          opacity: 0.8,
          zIndex: -1,
          attribution: atribucion,
          subdomains: subdomains,
          maxZoom: 21,
          maxNativeZoom: 19,
        }).addTo(this.map);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.setupMapListeners();
    //this.initWmsLayers(this.idVisor);
    //this.addLayerControl();
    //this.loadInteractiveLayers();
    this.loadInteractiveLayersWMS(this.idVisor);
    this.subscribeStatsToggle();

    // Ajuste en resize
    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => {
          this.updateToolbarPositions();
          this.cd.markForCheck();
        }, 0);
      });

    if (this.map) {
      this.map.whenReady(() => {
        this.map.on('click', async (e) => {
          const featuresFound: any[] = [];
          const promises: Promise<any>[] = [];

          for (const layer of Object.values(this.mapSvc.getAllLayersState())) {
            const layerName = layer.layerName;
            const cfg = this.getConfigByIndex(this.idVisor);

            if (layer.visible && layerName !== "cc_limite_municipio" && cfg) {
              const promise = this.fetchFeature(cfg, layerName, e.latlng);
              promises.push(promise);
            }
          }

          const results = await Promise.all(promises);
          //console.log('Resultados =>', results)
          for (const r of results) {
            if (r.result) {
              featuresFound.push({
                layerName: r.layerName,
                data: r.result
              });
            }
          }
          featuresFound.forEach((feat) => {
            const feature = feat.data;
            const layerName = feat.layerName;
            const cfg = this.getConfigByIndex(this.idVisor);

            let id: string | null;

            // if (cfg && (cfg.workspace === 'Ofertas_Zipaquira' || cfg.workspace === 'Ofertas_Cajica')){
            //   id = String(feature.id).split('.').pop();
            // } else {
            //   id =
            //   feature.properties.predio_id ||
            //   feature.properties.cr_construcciones_id
            // }

            id = feature.properties.predio_id ||
              feature.properties.id_dato_seccion ||
              feature.properties.fichaconstrudetalle_id ||
              feature.properties.ubicacion_id
            //feature.properties.cr_unidadesconstruccion_id

            //console.log('Feature: ', feature);            

            //const id =
            //feature.properties.predio_id ||
            //feature.properties.cr_construcciones_id;
            //feature.properties.cr_unidadesconstruccion_id;
            //if (!id) return;

            const key = `${feat.layerName}-${id}`;
            if (id && this.layersService.hasLayerId(layerName, Number(id))) {
              const layer = this.layersService.getLayerObject(layerName, Number(id));
              if (layer) {
                this.map.removeLayer(layer);
              }
              if (this.highlight) {
                this.map.removeLayer(this.highlight);
                this.highlight = null
                this.mapSvc.setHighlight(this.highlight);
                this.featureAux = null;
              }
              this.layersService.removeLayerId(layerName, Number(id));
              this.removeFromSelection(feature);
              this.dialogService.closeByKey(key);
              this.layersService.decrement();
            } else if (id) {
              this.addToSelection(feature);
              const counter = this.layersService.increment();


              // this.highlight = L.geoJSON(feature, {
              //   style: {
              //     color: '#b91515ff',
              //     weight: 1,
              //     fillColor: '#b41a1aff',
              //     fillOpacity: 0.3,
              //   },
              // }).addTo(this.map);


              const highlight_ = L.geoJSON(feature, {
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
              const latlng = highlight_.getBounds().getCenter();

              this.map.flyTo(latlng, 18, {
                animate: true,
                duration: 0.5
              });

              this.layersService.addLayerId(layerName, Number(id), highlight_);
              const selectedFeatureData = { id, layerName, counter, idVisor: this.idVisor, entidad: cfg?.entidad };
              this.dialogService.openRefer(
                {
                  component: ContactCardComponent,
                  data: selectedFeatureData,
                },
                key
              );
            } else {
              this.featureAux = feature;
            }
          })
          if (this.layersService.getCount() > 0 && this.featureAux) {
            this.highlight = L.geoJSON(this.featureAux, {
              style: {
                color: '#b91515ff',
                weight: 1,
                fillColor: '#b41a1aff',
                fillOpacity: 0.3,
              },
            }).addTo(this.map);
            this.mapSvc.setHighlight(this.highlight);
          }
          //console.log('Features Encontradas: ', featuresFound)
        })
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) this.map.remove();
  }

  private loadWFSubicaciones(idVisor: string): void {
    const cfg = this.getConfigByIndex(idVisor);
    if (cfg) {
      this.centrarMapaEnPoligonos('POC_Realasset', cfg.centroide);

      this.geometrySvc.getLayerWFS_(cfg.workspace, 'ubicacion').subscribe((features) => {
        //console.log('Features =>', features)
        if (!features) return;
        const geoLayer = L.geoJSON(features, {
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
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {

              let id: string | undefined;
              // if (cfg.workspace === 'Ofertas_Zipaquira' || cfg.workspace === 'Ofertas_Cajica'){
              //   id = String(feature.id).split('.').pop();
              // } else {
              //   id =
              //   feature.properties.predio_id ||
              //   feature.properties.cr_construcciones_id
              // }

              id = feature.properties.predio_id ||
                feature.properties.id_dato_seccion ||
                feature.properties.fichaconstrudetalle_id ||
                feature.properties.ubicacion_id
              //feature.properties.cr_unidadesconstruccion_id
              //console.log('Feature: ', feature);
              if (!id) return;

              const key = `${'ubicacion'}-${id}`;

              if (this.layersService.hasLayerId('ubicacion', Number(id))) {
                const layer = this.layersService.getLayerObject('ubicacion', Number(id));
                if (layer) {
                  this.map.removeLayer(layer);
                }
                if (this.highlight) {
                  this.map.removeLayer(this.highlight);
                  this.highlight = null
                  this.mapSvc.setHighlight(this.highlight);
                  this.featureAux = null;
                }
                this.layersService.removeLayerId('ubicacion', Number(id));
                this.removeFromSelection(feature);
                this.dialogService.closeByKey(key);
                this.layersService.decrement();
              } else {
                this.addToSelection(feature);
                const counter = this.layersService.increment();

                const highlight_ = L.geoJSON(feature, {
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
                const latlng = highlight_.getBounds().getCenter();

                this.map.flyTo(latlng, 18, {
                  animate: true,
                  duration: 0.5
                });

                this.layersService.addLayerId('ubicacion', Number(id), highlight_);
                const selectedFeatureData = { id, layerName: 'ubicacion', counter, idVisor: this.idVisor, entidad: cfg?.entidad };
                this.dialogService.openRefer(
                  {
                    component: ContactCardComponent,
                    data: selectedFeatureData,
                  },
                  key
                );
              }
              this.highlight = L.geoJSON(this.featureAux, {
                style: {
                  color: '#b91515ff',
                  weight: 1,
                  fillColor: '#b41a1aff',
                  fillOpacity: 0.3,
                },
              }).addTo(this.map);
              this.mapSvc.setHighlight(this.highlight);
            });
          },
        });
        //const bounds = geoLayer.getBounds();
        //this.map.flyToBounds(bounds,{duration: 0.5})
        this.mapSvc.setGeoJSONLayer(geoLayer);
        this.mapSvc.setDataToGeoJSONLayer(features);
        this.mapSvc.setDataCompletaWFS(features);

        this.mapSvc.toggleLayer('ubicacion', true);
        this.mapSvc.setLayerState(
          'ubicacion',
          true,
          100,
          'interactive',
          'Ubicación'
        );

        //console.log('Features =>', features)
      });
    }
  }

  private loadWFSterrenos(idVisor: string): void {
    const cfg = this.getConfigByIndex(idVisor);
    if (cfg) {

      if (this.idVisor === '1' || this.idVisor === '3') {
        this.centrarMapaEnPoligonos('POC_Realasset', cfg.centroide);
      } else {
        this.centrarMapaEnPoligonos('Geovisor-Cajica', cfg.centroide);
      }
      this.geometrySvc.getLayerWFS_(cfg.workspace, 'cr_terrenos').subscribe((features) => {
        //console.log('Features =>', features)
        if (!features) return;
        const geoLayer = L.geoJSON(features, {
          style: {
            color: '#403d3d',
            weight: 1,
            fillColor: '#AAAAAA',
            fillOpacity: 0.7,
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {

              let id: string | undefined;
              // if (cfg.workspace === 'Ofertas_Zipaquira' || cfg.workspace === 'Ofertas_Cajica'){
              //   id = String(feature.id).split('.').pop();
              // } else {
              //   id =
              //   feature.properties.predio_id ||
              //   feature.properties.cr_construcciones_id
              // }

              id = feature.properties.predio_id ||
                feature.properties.id_dato_seccion ||
                feature.properties.fichaconstrudetalle_id
              //feature.properties.cr_unidadesconstruccion_id
              console.log('Feature: ', feature);
              if (!id) return;

              const key = `${'cr_terrenos'}-${id}`;

              if (this.layersService.hasLayerId('cr_terrenos', Number(id))) {
                // Deseleccionar
                this.layersService.removeLayerId('cr_terrenos', Number(id));
                this.removeFromSelection(feature);
                (layer as any).setStyle({
                  color: '#403d3d',
                  weight: 1,
                  fillColor: '#AAAAAA',
                  fillOpacity: 0.7,
                });
                this.dialogService.closeByKey(key);
              } else {
                // Seleccionar
                this.layersService.addLayerId('cr_terrenos', Number(id));
                this.addToSelection(feature);
                (layer as any).setStyle({
                  color: '#b91515ff',
                  weight: 1,
                  fillColor: '#b41a1aff',
                  fillOpacity: 0.3,
                });
                const selectedFeatureData = { id, layerName: 'cr_terrenos', idVisor: this.idVisor, entidad: cfg?.entidad };
                this.dialogService.openRefer(
                  {
                    component: ContactCardComponent,
                    data: selectedFeatureData,
                  },
                  key
                );
              }
            });
          },
        });
        //const bounds = geoLayer.getBounds();
        //this.map.flyToBounds(bounds,{duration: 0.5})
        this.mapSvc.setGeoJSONLayer(geoLayer);
        this.mapSvc.setDataToGeoJSONLayer(features);
        this.mapSvc.setDataCompletaWFS(features);
        //console.log('Features =>', features)
      });
    }
  }

  async centrarMapaEnPoligonos(wSpace: string, centroide: string): Promise<void> {
    const center = await this.geometrySvc.getCenterOfPolygons(
      wSpace,
      centroide
    );

    if (center && this.map) {
      this.map.flyTo(center, 8, {
        animate: true,
        duration: 0.5
      });
      //this.map.setView(center, 14); 
      //console.log('Cetro del mapa: ', center)
      this.locationSvc.updateLocation([center.lat, center.lng], 8);
    } else {
      console.warn('No se pudo calcular el centro de los polígonos');
    }
  }

  // ─── Inicialización de Leaflet ───────────────────────────────────────────

  // private loadInteractiveLayers(): void {
  //   console.log('Cargando capas interactivas...');
  //   const interactiveLayers = ['cr_terrenos', 'cr_unidadesconstruccion'];

  //   interactiveLayers.forEach((layerName) => {
  //     this.geometrySvc
  //       .getLayerWFS_('Geovisor-Zipaquira', layerName)
  //       .subscribe((data) => {
  //         if (!data) return;

  //         const geoLayer = L.geoJSON(data, {
  //           style: {
  //             color: '#403d3d',
  //             weight: 1,
  //             fillColor: '#AAAAAA',
  //             fillOpacity: 0.7,
  //           },
  //           onEachFeature: (feature, layer) => {
  //             layer.on('click', () => {
  //               if (this.highlight) {
  //                 this.map.removeLayer(this.highlight);
  //               }
  //               this.highlight = L.geoJSON(feature, {
  //                 style: {
  //                   color: '#30fcfc',
  //                   weight: 1,
  //                   fillColor: '#30fcfc',
  //                   fillOpacity: 0.3,
  //                 },
  //               }).addTo(this.map);

  //               this.map.fitBounds(this.highlight.getBounds());
  //               this.mapSvc.setHighlight(this.highlight);
  //               console.log('datos capa: ', feature)

  //               // extraigo el id de la capa
  //               const id = feature.properties.cr_terrenos_id || feature.properties.cr_unidadesconstruccion_id;
  //               console.log('datos capa: ', id)
  //               const selectedFeatureData = { id, layerName };

  //               // Mostrar datos del feature
  //               this.dialogService.open({
  //                 component: ContactCardComponent,
  //                 data: selectedFeatureData,
  //               });
  //             });
  //           },
  //         });

  //         console.log(`Capa ${layerName} cargada.`, geoLayer);
  //         this.mapSvc.setGeoJSONLayer(geoLayer);
  //         this.mapSvc.setDataToGeoJSONLayer(data);
  //         this.mapSvc.setDataCompletaWFS(data ?? []);

  //         this.layerControl?.addOverlay(geoLayer, layerName);
  //         this.mapSvc.registerLayer(layerName, geoLayer, 'interactive');
  //       });
  //   });
  // }

  // private selectedFeatures = new Set<string>();
  // private loadInteractiveLayers(): void {
  //   const interactiveLayers = ['cr_terrenos', 'cr_unidadesconstruccion'];
  //   interactiveLayers.forEach((layerName) => {
  //     // ya existe en MapService? -> no recrear
  //     //if (this.mapSvc.getLayerNames().includes(layerName)) {
  //     //  return;
  //     //}

  //     this.geometrySvc
  //       .getLayerWFS_('Geovisor-Zipaquira', layerName)
  //       .subscribe((features) => {
  //         if (!features) return;

  //         const geoLayer = L.geoJSON(features, {
  //           style: {
  //             color: '#403d3d',
  //             weight: 1,
  //             fillColor: '#AAAAAA',
  //             fillOpacity: 0.7,
  //           },
  //           onEachFeature: (feature, layer) => {
  //             layer.on('click', () => {
  //               console.log('Feature clicado:', feature);
  //               const id =
  //                 feature.properties.predio_id ||
  //                 feature.properties.cr_unidadesconstruccion_id;
  //               if (!id) return;

  //               const key = `${layerName}-${id}`;

  //               if (this.layersService.hasLayerId(layerName, id)) {
  //                 // Deseleccionar
  //                 this.layersService.removeLayerId(layerName, id);
  //                 this.removeFromSelection(feature);
  //                 (layer as any).setStyle({
  //                   color: '#403d3d',
  //                   weight: 1,
  //                   fillColor: '#AAAAAA',
  //                   fillOpacity: 0.7,
  //                 });
  //                 this.dialogService.closeByKey(key);
  //               } else {
  //                 // Seleccionar
  //                 this.layersService.addLayerId(layerName, id);
  //                 this.addToSelection(feature);
  //                 (layer as any).setStyle({
  //                   color: '#b91515ff',
  //                   weight: 1,
  //                   fillColor: '#b41a1aff',
  //                   fillOpacity: 0.3,
  //                 });
  //                 const selectedFeatureData = { id, layerName };
  //                 this.dialogService.openRefer(
  //                   {
  //                     component: ContactCardComponent,
  //                     data: selectedFeatureData,
  //                   },
  //                   key
  //                 );
  //               }
  //             });
  //           },
  //         });

  //         // registrar en memoria local
  //         this.interactiveLayerMap.set(layerName, geoLayer);

  //         // registrar en MapService con visible:false (arrancan ocultas)
  //         this.mapSvc.registerLayer(
  //           layerName,
  //           geoLayer,
  //           'interactive',
  //           layerName
  //         );

  //         this.map.addLayer(geoLayer); //-> show-layer decide cuándo mostrar
  //         this.layerControl?.addOverlay(geoLayer, layerName); //-> no se usa el control visual

  //         if (layerName === 'cr_terrenos') {
  //           this.mapSvc.setGeoJSONLayer(geoLayer);
  //           this.mapSvc.setDataToGeoJSONLayer(features);
  //           this.mapSvc.setDataCompletaWFS(features);
  //         }
  //       });
  //   });
  // }

  private addToSelection(feature: any) {
    this.selectedLayer.addData(feature);
  }

  private removeFromSelection(feature: any) {
    this.selectedLayer.eachLayer((l: any) => {
      if (
        l.feature.properties.cr_terrenos_id === feature.properties.cr_terrenos_id ||
        l.feature.properties.cr_construcciones_id === feature.properties.cr_construcciones_id
        //l.feature.properties.cr_unidadesconstruccion_id === feature.properties.cr_unidadesconstruccion_id
      ) {
        this.selectedLayer.removeLayer(l);
      }
    });
  }

  // private initWmsLayers(wSpace: string): void {
  //   const configs = this.geometrySvc.getLayersByIdVisor();

  //   // Solo añadir al control los WMS de tipo "masivo"
  //   configs
  //     .filter((cfg) =>
  //       ['cc_limite_municipio', 'Terreno'].includes(cfg.layerName)
  //     )
  //     .forEach((cfg) => {
  //       const layer = L.tileLayer.wms(
  //         this.geometrySvc.getWMSLayersURL(wSpace),
  //         //this.geometrySvc.getWMSLayersURL().replace('/wms', '/gwc/service/wms'),
  //         this.geometrySvc.getWMSLayersParams(cfg)
  //       );
  //       this.wmsLayers.push(layer);
  //       this.mapSvc.registerLayer(cfg.layerName, layer, 'bulk');
  //     });
  // }

  private initMap(): void {
    const init = this.locationSvc.getLocationInitial();
    const [lat, lng] = init.location as [number, number];

    this.map = L.map('map', {
      zoomControl: false,
      //maxZoom: 21,
      //minZoom: 3,
      preferCanvas: true,
      zoomSnap: 0.1,
      attributionControl: false,
    }).setView([lat, lng], init.zoom);
    //this.map.flyToBounds(this.bounds,{padding: [50, 50], duration: 1.5})
    this.zoomLevel = init.zoom;

    this.tileLayer = L.tileLayer(this.baseMapP.url, {
      attribution: this.baseMapP.atribucion,
      opacity: 0.8,
      maxNativeZoom: 18,
      maxZoom: 21,
      subdomains: this.baseMapP.subdomains,
    }).addTo(this.map);

    this.mapSvc.setMap(this.map);
  }

  private addLayerControl(): void {
    this.wmsLayers.forEach((layer) => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });

    const overlays: Record<string, L.Layer> = {};
    this.wmsLayers.forEach((layer) => {
      const raw = (layer.options.layers as string) || '';
      const label = raw
        .split(':')
        .pop()!
        .toLowerCase()
        .split('_')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
      overlays[label] = layer;
    });

    this.layerControl = L.control.layers({}, overlays, { collapsed: false, position: 'bottomright' }).addTo(this.map);
    this.mapSvc.setLayerControl(this.layerControl);

    this.map.on('overlayadd', (e: L.LayerEvent) => {
      if (e.layer === this.plainLayer) {
        this.map.addLayer(this.plainLayer);
        if (this.map.hasLayer(this.markerCluster)) {
          this.map.removeLayer(this.markerCluster);
        }
      }
      if (e.layer === this.markerCluster) {
        this.map.addLayer(this.markerCluster);
        if (this.map.hasLayer(this.plainLayer)) {
          this.map.removeLayer(this.plainLayer);
        }
      }
    });

    this.map.on('overlayremove', (e: L.LayerEvent) => {
      if (e.layer === this.plainLayer) {
        // Quitar marcadores individuales
        this.map.removeLayer(this.plainLayer);
      }
      if (e.layer === this.markerCluster) {
        // Quitar cluster
        this.map.removeLayer(this.markerCluster);
      }
    });
  }

  /** Suscribe toggle de estadísticas para reposicionar toolbar **/
  private subscribeStatsToggle(): void {
    this.statsToggle.state$.pipe(takeUntil(this.destroy$)).subscribe((open) => {
      this.showStatistics = open;
      setTimeout(() => {
        this.updateToolbarPositions();
        this.cd.markForCheck();
      }, 0);
    });
  }

  // ─── Mark Mode ──────────────────────────────────────────────────────────────

  toggleMarkMode(): void {
    this.map
      .locate({ setView: true, maxZoom: 16 })
      .on('locationfound', (e) => {
        const latlng = e.latlng;

        const myIcon = L.icon({
          iconUrl: 'assets/marker.svg',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -30],
        });
        L.marker(latlng, { icon: myIcon })
          .addTo(this.map)
          // .bindPopup(`Latitud: ${latlng.lat.toFixed(6)}<br>Longitud: ${latlng.lng.toFixed(6)}<br>Precisión: ${e.accuracy.toFixed(2)} metros`)
          .bindPopup(
            `Longitud: ${latlng.lng.toFixed(
              6
            )}<br>Latitud: ${latlng.lat.toFixed(
              6
            )}<br>Precisión: ${e.accuracy.toFixed(2)} metros`
          )
          .openPopup();
      })
      .on('locationerror', (e) => alert(e.message));
  }

  // ─── Estadísticas & Toolbar ────────────────────────────────────────────────

  onStatsToggled(): void {
    this.showStatistics = !this.showStatistics;
    setTimeout(() => {
      this.updateToolbarPositions();
      this.cd.markForCheck();
    }, 0);
  }

  private updateToolbarPositions(): void {
    const el = this.statsRef?.nativeElement;
    const statsW =
      this.showStatistics && el ? el.getBoundingClientRect().width : 0;
    const parentW = el?.parentElement
      ? el.parentElement.getBoundingClientRect().width
      : 0;
    this.toolbarLeftPx = (parentW - statsW) / 2;
    this.toolbarRightPx = statsW + this.toolbarOffset;
  }

  // ─── Acciones del Toolbar ───────────────────────────────────────────────────

  private setupMapListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      this.map.on('zoomend', () => {
        this.mapSvc.updateZoomLevel(this.updateScale());
        this.zoomLevel = this.map.getZoom();
        this.mapSvc.updateZoomLevelMobile(this.zoomLevel);
        this.cd.markForCheck();
        this.estadoService.actualizarZoom(this.map.getZoom())
      });
      this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const point = this.crs9377.project(e.latlng); // x, y en metros (EPSG:9377)
        this.mapSvc.updateCursorCoords([point.x, point.y]);
      });
    });
  }

  resetMap(): void {
    const init = this.locationSvc.getLocationInitial();
    const [lat, lng] = init.location as [number, number];
    this.map.setView([lat, lng], init.zoom);
    if (this.lastMarker) {
      this.map.removeLayer(this.lastMarker);
      this.lastMarker = undefined;
    }
  }

  private updateScale(): string {
    const mapSize = this.map.getSize();
    const y = mapSize.y / 2;

    const pointA = this.map.containerPointToLatLng([0, y]);
    const pointB = this.map.containerPointToLatLng([100, y]);

    const distanceMeters = pointA.distanceTo(pointB);

    if (distanceMeters >= 1000) {
      const distanceKm = distanceMeters / 1000;
      const roundedKm = Math.round(distanceKm);
      return `${roundedKm} km`;
    } else {
      const roundedMeters = Math.round(distanceMeters);
      return `${roundedMeters} m`;
    }
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  onRangeChange(z: number): void {
    this.map.setZoom(z);
    this.zoomLevel = z;
    //console.log('Zoom level:', this.zoomLevel);
  }

  onHideToolbarVertical(show: any) {
    this.showToolbarVertical = show;
  }

  locateUser(): void {
    return;
  }

  private loadInteractiveLayersWMS(idVisor: string): void {
    //const interactiveLayers = ['cr_terrenos', 'cr_unidadesconstruccion'];
    const interactiveLayers = this.geometrySvc.getLayersByIdVisor();
    const cfg = this.getConfigByIndex(idVisor);
    if (cfg) {
      interactiveLayers.forEach((layerName) => {
        const layer = L.tileLayer.wms(
          this.geometrySvc.getWMSLayersURL(cfg.workspace),
          //this.geometrySvc.getWMSLayersURL().replace('/wms', '/gwc/service/wms'),
          this.geometrySvc.getWMSLayersParams(layerName)
        );
        //this.wmsLayers.push(layer);
        console.log('Capa Importada =>', layer)
        this.interactiveLayerMap.set(layerName.layerName, layer);
        if (layerName.visible) {
          this.map.addLayer(layer);
        }

        this.mapSvc.registerLayer(
          layerName.layerName,
          layer,
          'interactive',
          layerName.labelName);
      });
    }

    //interactiveLayers.forEach((layerName) => {
    // ya existe en MapService? -> no recrear
    //if (this.mapSvc.getLayerNames().includes(layerName)) {
    //  return;
    //}

    //this.geometrySvc
    //.getLayerWFS_('Geovisor-Zipaquira', layerName)
    //.subscribe((features) => {
    //  if (!features) return;

    // const geoLayer = L.geoJSON(features, {
    //   style: {
    //     color: '#403d3d',
    //     weight: 1,
    //     fillColor: '#AAAAAA',
    //     fillOpacity: 0.7,
    //   },
    //   onEachFeature: (feature, layer) => {
    //     layer.on('click', () => {
    //       console.log('Feature clicado:', feature);
    //       const id =
    //         feature.properties.predio_id ||
    //         feature.properties.cr_unidadesconstruccion_id;
    //       if (!id) return;

    //       const key = `${layerName}-${id}`;

    //       if (this.layersService.hasLayerId(layerName, id)) {
    //         // Deseleccionar
    //         this.layersService.removeLayerId(layerName, id);
    //         this.removeFromSelection(feature);
    //         (layer as any).setStyle({
    //           color: '#403d3d',
    //           weight: 1,
    //           fillColor: '#AAAAAA',
    //           fillOpacity: 0.7,
    //         });
    //         this.dialogService.closeByKey(key);
    //       } else {
    //         // Seleccionar
    //         this.layersService.addLayerId(layerName, id);
    //         this.addToSelection(feature);
    //         (layer as any).setStyle({
    //           color: '#b91515ff',
    //           weight: 1,
    //           fillColor: '#b41a1aff',
    //           fillOpacity: 0.3,
    //         });
    //         const selectedFeatureData = { id, layerName };
    //         this.dialogService.openRefer(
    //           {
    //             component: ContactCardComponent,
    //             data: selectedFeatureData,
    //           },
    //           key
    //         );
    //       }
    //     });
    //   },
    // });

    // registrar en memoria local
    //this.interactiveLayerMap.set(layerName, geoLayer);

    // registrar en MapService con visible:false (arrancan ocultas)
    //this.mapSvc.registerLayer(
    //  layerName,
    //  geoLayer,
    //  'interactive',
    //  layerName
    //);

    //this.map.addLayer(geoLayer); //-> show-layer decide cuándo mostrar
    //this.layerControl?.addOverlay(geoLayer, layerName); //-> no se usa el control visual

    //});
    //});
  }

  getConfigByIndex(id: string) {
    const config = this.visorMap.get(id);
    if (!config) {
      console.warn(`No existe visor para el id ${id}`);
      return null;
    }
    return config;
  }

  private fetchFeature(cfg: any, layerName: string, latlng: any): Promise<any> {
    return this.geometrySvc
      .getFeatureWFS(cfg.workspace, layerName, this.map, latlng)
      .then(result => ({
        result,
        layerName
      }));
  }


}
