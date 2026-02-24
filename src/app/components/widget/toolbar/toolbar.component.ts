// src/app/features/widget/toolbar/toolbar.component.ts
import L from 'leaflet';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToolBar } from '../../../interfaces/toolbar';
import { ToolbarService } from '../../../core/services/widget/toolbar.service';
import { Subscription } from 'rxjs';
import * as turf from '@turf/turf';
import { MapService } from '../../../core/services/home/map/map.service';

// Geoman
import '@geoman-io/leaflet-geoman-free';
//import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import type { Feature, FeatureCollection, Polygon } from 'geojson';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.less',
})
export class ToolbarComponent implements OnInit, OnDestroy {
  activeIndex: number | null = null;
  imagesDefault: ToolBar[] = [];
  private map!: L.Map;
  private drawLayer!: L.LayerGroup;
  private readonly subs = new Subscription();
  currentPolygon: L.Polygon | null = null;
  private currentPolyline: L.Polyline | null = null;
  drawing = false;
  allMarkers: L.Marker[] = [];

  medicionActiva = false;
  perimeter = 0;
  area = 0;
  medida = 0;

  private markerClusterGroup: L.MarkerClusterGroup | null = null;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly toolbarService: ToolbarService,
    private readonly mapService: MapService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getIcons();
    this.subs.add(
      this.mapService.map$.subscribe((m) => {
        if (m && !this.map) {
          this.map = m;
          this.initGeoman();
        }
      })
    );

    this.subscriptions.add(
      this.mapService.markerClusterGroup$.subscribe((group) => {
        this.markerClusterGroup = group;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  getIcons(): void {
    this.imagesDefault = this.toolbarService.getToolBar();
  }

  resetMap(): void {
    this.map.setView([4.66, -74.0721], 12);
  }

  onChangeImage(id: number, type: string): void {
    this.activeIndex = this.activeIndex === id ? null : id;
    this.medicionActiva = false;
    this.clearMeasurements();
    this.clearSelection();
    switch (id) {
      case 1:
        this.enableRectangleDraw();
        break;
      case 2:
        this.enablePolylineDraw();
        break;
      case 3:
        this.enablePolygonDraw();
        break;
      case 4:
        this.clearSelection();
        break;
      case 5:
        this.resetMap();
        break;
    }
  }

// --------------------------------------------------------------------------------------
// La lógica de Geoman permanece igual, confiando en startDrawing/endDrawing del servicio.
// --------------------------------------------------------------------------------------
  private initGeoman() {
    if (!this.map) return;

    this.drawLayer = new L.LayerGroup().addTo(this.map);

    // --- 1. Comienza dibujo ---
    this.map.on('pm:drawstart', (e: any) => {
      this.mapService.startDrawing(); 
      this.drawing = true;
    });

    // --- 2. Termina dibujo ---
    this.map.on('pm:drawend', () => {
      this.mapService.endDrawing();
      this.drawing = false;
    });

    // --- 3. Cuando se crea la geometría ---
    this.map.on('pm:create', (e: any) => {
      if (e.shape === 'Polygon' || e.shape === 'Rectangle') {
        if (this.currentPolygon) {
          this.drawLayer.removeLayer(this.currentPolygon);
        }
        const layer = e.layer as L.Polygon;
        this.currentPolygon = layer;
        this.drawLayer.addLayer(layer);
        this.updatePolygonMeasurements(layer);

        layer.on('click', (ev: any) => L.DomEvent.stop(ev));
      } else if (e.shape === 'Line') {
        this.handlePolyline(e.layer as L.Polyline);
        e.layer.on('click', (ev: any) => L.DomEvent.stop(ev));
      }

      this.map?.pm.disableDraw();
      this.drawing = false;
    });

    // --- 4. Mientras dibujas ---
    this.map.on('pm:drawvertex', (e: any) => {
      const layer = e.workingLayer;
      if (!layer) return;

      if (layer instanceof L.Polygon) {
        this.updatePolygonMeasurements(layer);
      } else if (layer instanceof L.Polyline) {
        this.measurePolyline(layer);
      }
    });

    // --- 5. Cambios en el dibujo ---
    this.map.on('pm:drawchange', (e: any) => {
      const layer = e.workingLayer;
      if (!layer) return;

      if (layer instanceof L.Polygon) {
        this.updatePolygonMeasurements(layer);
      } else if (layer instanceof L.Polyline) {
        this.measurePolyline(layer);
      }
    });
  }


// --------------------------------------------------------------------------------------
// Funciones de habilitación de dibujo con la corrección 'as any'
// --------------------------------------------------------------------------------------

  // polígonos
  enablePolygonDraw() {
    this.medicionActiva = true;
    this.mapService.startDrawing();
    this.map?.pm.enableDraw('Polygon', {
      finishOn: 'dblclick',
      disableGlobalEdit: true // <--- CLAVE DE LA FUNCIONALIDAD
    } as any); // <--- CORRECCIÓN DE TIPO: permite la propiedad extra
  }

  // rectángulos
  enableRectangleDraw() {
    this.medicionActiva = true;
    this.mapService.startDrawing();
    this.map?.pm.enableDraw('Rectangle', {
      finishOn: 'dblclick',
      disableGlobalEdit: true // <--- CLAVE DE LA FUNCIONALIDAD
    } as any); // <--- CORRECCIÓN DE TIPO: permite la propiedad extra
  }

  enablePolylineDraw() {
    this.medicionActiva = true;
    this.mapService.startDrawing();
    this.map?.pm.enableDraw('Line', {
      finishOn: 'dblclick',
      pathOptions: { color: '#0672b9' },
      disableGlobalEdit: true // <--- CLAVE DE LA FUNCIONALIDAD
    } as any); // <--- CORRECCIÓN DE TIPO: permite la propiedad extra
    this.drawing = true;
  }

  clearSelection() {
    if (this.currentPolygon) {
      this.drawLayer.removeLayer(this.currentPolygon);
      this.currentPolygon = null;
    }

    if (this.currentPolyline) {
      this.drawLayer.removeLayer(this.currentPolyline);
      this.currentPolyline = null;
    }

    this.mapService.setSelectedIds([]);
    this.map.pm.disableDraw();
    this.drawing = false;
    this.map.closePopup();

    this.mapService.setSelectedIds([]);

    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: this.allMarkers.map((marker) => (marker as any).toGeoJSON()),
    };
    this.mapService.setSelectedGeoJson(featureCollection);
    this.mapService.endDrawing();
  }

  private handlePolyline(layer: L.Polyline) {
    if (this.currentPolyline) {
      this.drawLayer.removeLayer(this.currentPolyline);
    }
    this.currentPolyline = layer;
    this.drawLayer.addLayer(layer);
    this.measurePolyline(layer);
  }

  private measurePolyline(line: L.Polyline) {
    const latlngs = line.getLatLngs() as L.LatLng[];
    let totalMeters = 0;
    for (let i = 1; i < latlngs.length; i++) {
      totalMeters += latlngs[i - 1].distanceTo(latlngs[i]);
    }

    this.medida = totalMeters;
    this.cdr.detectChanges();
  }

  private updatePolygonMeasurements(polygon: L.Polygon) {
    const polyGeo = polygon.toGeoJSON() as Feature<Polygon>;
    this.area = turf.area(polyGeo); // m²
    this.perimeter = turf.length(polyGeo, { units: 'meters' }); // m
    this.cdr.detectChanges();
  }

  clearMeasurements() {
    this.area = 0;
    this.perimeter = 0;
    this.medida = 0;
    this.map.closePopup();
  }
}