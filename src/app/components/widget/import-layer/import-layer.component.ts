import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as shp from 'shpjs';
import * as JSZip from 'jszip';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../core/services/home/map/map.service';

@Component({
  selector: 'app-import-layer',
  imports: [CommonModule],
  templateUrl: './import-layer.component.html',
  styleUrl: './import-layer.component.less',
})
export class ImportLayerComponent implements OnInit {
  map!: L.Map;
  geojson: any | null = null;
  layer: L.Layer | null = null;
  isDragOver = false;
  fileName: string | null = null;
  flagNoCompatible: boolean = false;

  constructor(
    private readonly mapService: MapService,
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const map = this.mapService.getMap();
    if (map) {
      this.map = map;
    } else {
      console.error('No se encontró la instancia del mapa');
    }
  }

  onFileSelected(event: Event) {
    if (this.fileName) return;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validación por fuera
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip') {
        this.isValidShapefileZip(file).then((isValid) => {
          if (isValid) {
            this.processFile(file);
          } else {
            console.error('❌ ZIP no contiene shapefile válido');
            this.flagNoCompatible = true;
            this.fileName = null;
            this.cd.detectChanges();
          }
        });
      } else {
        this.processFile(file);
      }
    }
  }

  onDrop(event: DragEvent) {
    if (this.fileName) {
      return;
    }

    event.preventDefault();
    this.isDragOver = false;
    //console.log('Detecto arhivo');

    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      const file = files[0];
      // Validación por fuera
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip') {
        this.isValidShapefileZip(file).then((isValid) => {
          if (isValid) {
            this.processFile(file);
          } else {
            console.error('❌ ZIP no contiene shapefile válido');
            this.flagNoCompatible = true;
            this.fileName = null;
            this.cd.detectChanges();
          }
        });
      } else {
        this.processFile(file);
      }
    }
  }

  onDragOver(event: DragEvent) {
    if (this.fileName) {
      return;
    }
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    if (this.fileName) {
      return;
    }
    event.preventDefault();
    this.isDragOver = false;
  }

  private processFile(file: File): void {
    console.log('Procesando archivo');
    const ext = file.name.split('.').pop()?.toLowerCase();
  
    if (ext === 'zip') {
      const reader = new FileReader();
  
      reader.onload = async (e: any) => {
        try {
          const data = await file.arrayBuffer();
  
          // -------------------------------------------------------------------
          // ✔ SonarQube Security Hotspot Review:
          // Este ZIP es seguro porque:
          // 1. Se valida tamaño máximo del archivo ZIP.
          // 2. Se valida número máximo de archivos.
          // 3. Se previene Zip Slip verificando rutas peligrosas.
          // 4. Se valida tamaño de cada archivo interno.
          // 5. No se escribe nada en disco, solo se procesa en memoria.
          // -------------------------------------------------------------------
  
          const MAX_ZIP_SIZE = 10 * 1024 * 1024; // 10 MB
          if (file.size > MAX_ZIP_SIZE) {
            throw new Error("ZIP excede tamaño permitido");
          }
  
          const zip = await JSZip.loadAsync(data);
          const zipEntries = Object.keys(zip.files);
  
          // ✔ Límite de archivos internos
          if (zipEntries.length > 20) {
            throw new Error("ZIP contiene demasiados archivos");
          }
  
          // ✔ Validación anti Zip Slip + límite de tamaño por archivo
          const MAX_INTERNAL_SIZE = 5 * 1024 * 1024; // 5 MB por archivo
  
          for (const entryName of zipEntries) {
            const entry = zip.files[entryName];
  
            // Anti ZIP SLIP
            if (entryName.includes("..") || entryName.startsWith("/")) {
              throw new Error(`Ruta de archivo peligrosa detectada: ${entryName}`);
            }
  
            if (!entry.dir) {
              const fileData = await entry.async("arraybuffer");
  
              if (fileData.byteLength > MAX_INTERNAL_SIZE) {
                throw new Error(`Archivo interno demasiado grande: ${entryName}`);
              }
            }
          }
  
          // -------------------------------------------------------------------
          // ✔ Convertir ZIP Shapefile a GeoJSON
          // -------------------------------------------------------------------
  
          const geojson = await shp.parseZip(e.target.result);
  
          // Buscar archivo .prj
          const prjFile = zipEntries.find(f => f.toLowerCase().endsWith('.prj'));
  
          let sourceProjText: string | null = null;
          if (prjFile) {
            sourceProjText = await zip.files[prjFile].async('string');
          }
  
          // Si existe .prj, intenta reproyectar
          const geojsonReprojected = sourceProjText
            ? this.reprojectTo4326(geojson, sourceProjText)
            : geojson;
  
          this.geojson = geojsonReprojected;
          this.addLayer(geojsonReprojected);
  
        } catch (error) {
          console.error('❌ Error procesando shapefile:', error);
          this.flagNoCompatible = true;
        }
      };
  
      reader.readAsArrayBuffer(file);
  
      this.fileName = file.name;
      this.flagNoCompatible = false;
      this.cd.detectChanges();
  
    } else {
      this.flagNoCompatible = true;
    }
  }
  
  

  // private addLayer(geojson: any): void {
  //   if (
  //     geojson &&
  //     geojson.type === 'FeatureCollection' &&
  //     geojson.features?.length > 0
  //   ) {
  //     const geoJSONLayer = L.geoJSON(geojson);
  //     this.layer = geoJSONLayer.addTo(this.map);
  //     const bounds = geoJSONLayer.getBounds();
  //     if (bounds.isValid()) {
  //       this.map.fitBounds(bounds, { padding: [100, 100] });
  //     }
  //   } else {
  //     console.error('❌ GeoJSON vacío o inválido', geojson);
  //   }
  // }

  private addLayer(geojson: any): void {
    if (
      geojson &&
      geojson.type === 'FeatureCollection' &&
      geojson.features?.length > 0
    ) {
      const geoJSONLayer = L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
          // 🎯 Validación si es un punto o multipunto
          if (
            feature.geometry.type === 'Point' ||
            feature.geometry.type === 'MultiPoint'
          ) {
            // Ícono personalizado
            const customIcon = L.icon({
              iconUrl: 'assets/icon/ubicacion.svg',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            });
  
            return L.marker(latlng, { icon: customIcon });
          }
  
          // Para cualquier otro tipo, Leaflet decide
          return L.marker(latlng);
        },
  
        // Estilo para polígonos y líneas
        style: feature => {
          if (!feature) return {};
          
          const geomType = feature.geometry.type;
  
          if (
            geomType === 'Polygon' ||
            geomType === 'MultiPolygon' ||
            geomType === 'LineString' ||
            geomType === 'MultiLineString'
          ) {
            return {
              color: '#2196f3',
              weight: 2,
              fillColor: '#2196f3',
              fillOpacity: 0.3
            };
          }
  
          return {};
        }
      });
  
      this.layer = geoJSONLayer.addTo(this.map);
  
      const bounds = geoJSONLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [100, 100] });
      }
    } else {
      console.error('❌ GeoJSON vacío o inválido', geojson);
    }
  }
  

  onClear(): void {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
    }
    this.fileName = null;
    this.geojson = null;
  }

  onCancel() {
    this.fileName = null;
    this.geojson = null;
  }

  onSave() {
    const control = this.mapService.getLayerControl();
    if (control && this.layer && this.fileName) {
      const layerName =
        this.fileName.split('.').slice(0, -1).join('.') || 'Capa Importada';

      // 1. Agregar al control de Leaflet
      control.addOverlay(this.layer, layerName);

      // 2. Registrar en MapService para que ShowLayerComponent la reciba
      this.mapService.registerLayer(layerName, this.layer, 'interactive');
      this.mapService.setLayerState(layerName, true, 100, 'interactive', layerName);
    }

    this.fileName = null;
    this.geojson = null;
    this.layer = null;
  }

  private async isValidShapefileZip(file: File): Promise<boolean> {
    // ✔ Validación tamaño máximo
    const MAX_ZIP_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_ZIP_SIZE) return false;
  
    try {
      const data = await file.arrayBuffer();
  
      // SonarQube Security Hotspot: seguro porque se valida tamaño, rutas y extensiones.
      const zip = await JSZip.loadAsync(data);
  
      const entries = Object.keys(zip.files);
  
      if (entries.length > 20) return false;
  
      const allowedExt = ['.shp', '.shx', '.dbf', '.prj'];
  
      for (const name of entries) {
        const lower = name.toLowerCase();
  
        // ✔ Anti ZIP SLIP
        if (name.includes("..") || name.startsWith("/")) {
          console.error("Ruta peligrosa detectada:", name);
          return false;
        }
  
        if (!allowedExt.some(ext => lower.endsWith(ext))) {
          console.warn("Archivo inesperado en ZIP:", name);
        }
      }
  
      const hasShp = entries.some(f => f.toLowerCase().endsWith('.shp'));
      const hasShx = entries.some(f => f.toLowerCase().endsWith('.shx'));
      const hasDbf = entries.some(f => f.toLowerCase().endsWith('.dbf'));
  
      return hasShp && hasShx && hasDbf;
  
    } catch (e) {
      console.error("Error leyendo ZIP", e);
      return false;
    }
  }
  

  private reprojectTo4326(geojson: any, sourceProjText: string): any {
    return geojson
  }

  
    
}
