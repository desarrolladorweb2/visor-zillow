import L from 'leaflet';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Feature, FeatureCollection } from 'geojson';
import { GeometryService } from './geometry.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: any;

  private layers: { [key: string]: L.Layer } = {};
  private layerStates: Record<
    string,
    { layerName: string, visible: boolean; opacity: number; type: string; labelName: string }
  > = {};

  constructor(private readonly geometryService: GeometryService) {
    this.geometryService.getLayersByIdVisor().forEach((cfg) => {
      this.layerStates[cfg.layerName] = {
        layerName: cfg.layerName,
        visible: cfg.visible,
        opacity: cfg.opacity,
        type: cfg.type,
        labelName: cfg.labelName,
        //labelName: cfg.labelName || cfg.layerName,
      };
    });
  }

  private readonly mapSubject = new BehaviorSubject<L.Map | null>(null);
  map$ = this.mapSubject.asObservable();

  private readonly markerClusterGroupSubject =
    new BehaviorSubject<L.MarkerClusterGroup | null>(null);
  markerClusterGroup$ = this.markerClusterGroupSubject.asObservable();

  private readonly selectedIdsSubject = new BehaviorSubject<string[]>([]);
  selectedIds$: Observable<string[]> = this.selectedIdsSubject.asObservable();

  private readonly _selectedGeoJson = new BehaviorSubject<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  public selectedGeoJson$: Observable<FeatureCollection> =
    this._selectedGeoJson.asObservable();

  private readonly cursorCoordsSubject = new BehaviorSubject<
    [number, number] | null
  >(null);
  cursorPosition$ = this.cursorCoordsSubject.asObservable();

  private readonly zoomLevelSubject = new BehaviorSubject<string | null>(null);
  private layerControl!: L.Control.Layers;

  private readonly zoomLevelMobileSubject = new BehaviorSubject<
    string | number | null
  >(null);
  zoomLevelMobile$ = this.zoomLevelMobileSubject.asObservable();

  zoomLevel$ = this.zoomLevelSubject.asObservable();
  geoJSONLayer: any;
  dataJSONLayer: any;
  highlight: L.GeoJSON | null = null;

  // observatorio inomobiliario
  private readonly dataCompletaWFSSubject = new BehaviorSubject<Feature[]>([]);
  dataCompletaWFS$: Observable<Feature[]> =
    this.dataCompletaWFSSubject.asObservable();

  private readonly dataFiltradaWFSSubject = new BehaviorSubject<Feature[]>([]);
  dataFiltradaWFS$: Observable<Feature[]> =
    this.dataFiltradaWFSSubject.asObservable();

  private readonly geoJSONLayerFiltroSubject =
    new BehaviorSubject<L.GeoJSON | null>(null);
  geoJSONLayerFiltro$: Observable<L.GeoJSON | null> =
    this.geoJSONLayerFiltroSubject.asObservable();

  private readonly layerStatesSubject = new BehaviorSubject<
    Record<
      string,
      { layerName: string, visible: boolean; opacity: number; type: string; labelName: string }
    >
  >(this.layerStates);

  layerStates$ = this.layerStatesSubject.asObservable();

  // Método para actualizar la capa
  setGeoJSONFiltroLayer(layer: L.GeoJSON | null) {
    this.geoJSONLayerFiltroSubject.next(layer);
  }

  // Método para obtener el valor actual
  getGeoJSONFiltroLayerValue(): L.GeoJSON | null {
    return this.geoJSONLayerFiltroSubject.getValue();
  }

  setDataCompletaWFS(data: Feature[]) {
    this.dataCompletaWFSSubject.next(data);
  }

  getDataCompletaWFS(): Feature[] {
    return this.dataCompletaWFSSubject.getValue();
  }

  setDataFiltradaWFS(data: Feature[]) {
    this.dataFiltradaWFSSubject.next(data);
  }

  getDataFiltradaWFS(): Feature[] {
    return this.dataFiltradaWFSSubject.getValue();
  }

  // fin

  setMap(map: L.Map) {
    this.mapSubject.next(map);
    this.map = map;
  }

  getMap() {
    return this.map;
  }

  setMarkerClusterGroup(markerClusterGroup: L.MarkerClusterGroup) {
    //console.log('info funcion', markerClusterGroup)
    this.markerClusterGroupSubject.next(markerClusterGroup);
  }

  getAllMarkers(): L.Layer[] {
    const clusterGroup = this.markerClusterGroupSubject.getValue();
    return clusterGroup ? clusterGroup.getLayers() : [];
  }

  setSelectedIds(ids: string[]) {
    //console.log('cambia ids: ', ids)
    this.selectedIdsSubject.next(ids);
  }

  setSelectedGeoJson(data: FeatureCollection) {
    //console.log('cambia geoJson: ', data)
    this._selectedGeoJson.next(data);
  }

  updateCursorCoords(coords: [number, number]) {
    this.cursorCoordsSubject.next(coords);
  }

  updateZoomLevel(zoom: string) {
    this.zoomLevelSubject.next(zoom);
  }

  setGeoJSONLayer(geoJSONLayer: L.GeoJSON) {
    this.geoJSONLayer = geoJSONLayer;
  }

  getGeoJSONLayer() {
    return this.geoJSONLayer;
  }

  setDataToGeoJSONLayer(data: any) {
    this.dataJSONLayer = data;
  }

  getDataToGeoJSONLayer() {
    return this.dataJSONLayer;
  }

  setHighlight(HighlightLayer: L.GeoJSON | null) {
    this.highlight = HighlightLayer;
  }

  getHighlight() {
    return this.highlight;
  }

  setLayerControl(control: L.Control.Layers) {
    this.layerControl = control;
  }

  getLayerControl(): L.Control.Layers {
    return this.layerControl;
  }

  setLayerState(
    layerName: string,
    visible: boolean,
    opacity: number,
    type: string,
    labelName: string
  ) {
    this.layerStates[layerName] = { layerName, visible, opacity, type, labelName };
    this.layerStatesSubject.next({ ...this.layerStates }); // emitir copia actualizada
  }

  // Sobreescribir registerLayer
  registerLayer(
    name: string,
    layer: L.Layer,
    type: 'interactive' | 'bulk',
    labelName?: string
  ) {
    this.layers[name] = layer;

    if (!this.layerStates[name]) {
      this.layerStates[name] = {
        layerName: name,
        visible: false,
        opacity: 100,
        type,
        labelName: labelName || name,
      };
    } else {
      this.layerStates[name].type = type;
    }

    this.layerStatesSubject.next({ ...this.layerStates }); // notificar cambio
  }

  getAllLayersState() {
    return this.layerStates;
  }

  toggleLayer(name: string, visible: boolean) {
    const layer = this.layers[name];
    if (!layer) return;
    if (visible) {
      layer.addTo(this.map);
    } else {
      this.map.removeLayer(layer);
    }
  }

  setOpacity(name: string, opacity: number) {
    const layer = this.layers[name];
    if (layer) {
      // For TileLayer (e.g., WMS, XYZ)
      if ((layer as L.TileLayer).setOpacity) {
        (layer as L.TileLayer).setOpacity(opacity / 100);
      }
      // For vector layers (Path, GeoJSON, etc.)
      else if ((layer as L.Path).setStyle) {
        (layer as L.Path).setStyle({
          opacity: opacity / 100,
          fillOpacity: opacity / 100,
        });
      }
      // Add more cases if you have other layer types that support opacity
    }
  }

  getLayerNames(): string[] {
    return Object.keys(this.layers);
  }

  updateZoomLevelMobile(zoom: string | number) {
    this.zoomLevelMobileSubject.next(zoom);
  }

  disableMapInteractions(): void {
    if (!this.map) return;
    this.map.dragging.disable();
    this.map.scrollWheelZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
    if (this.map.tap) this.map.tap.disable();
  }

  enableMapInteractions(): void {
    if (!this.map) return;
    this.map.dragging.enable();
    this.map.scrollWheelZoom.enable();
    this.map.doubleClickZoom.enable();
    this.map.boxZoom.enable();
    this.map.keyboard.enable();
    if (this.map.tap) this.map.tap.enable();
  }

  disableLayerClicks(): void {
    Object.entries(this.layers).forEach(([name, layer]) => {
      const state = this.layerStates[name];
      if (state?.type === 'interactive') {
        (layer as L.GeoJSON).eachLayer((l: any) => {
          l.off('click');
        });
      }
    });
  }

  enableLayerClicks(): void {
    Object.entries(this.layers).forEach(([name, layer]) => {
      const state = this.layerStates[name];
      if (state?.type === 'interactive') {
        (layer as L.GeoJSON).eachLayer((l: any) => {
          l.on('click', (e: any) => {
            this.highlight?.clearLayers();
            this.highlight?.addData(e.layer.feature);
          });
        });
      }
    });
  }

  startDrawing(): void {
    this.disableMapInteractions();
    this.disableLayerClicks();
  }

  endDrawing(): void {
    this.enableMapInteractions();
    this.enableLayerClicks();
  }
}
