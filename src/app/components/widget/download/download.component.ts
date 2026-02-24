import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SearchCriteria } from '../../../interfaces/search-criteria';
import { DownloadSidebarService } from '../../../core/services/widget/download-sidebar.service';
import { CommonModule } from '@angular/common';
import { ExportableService } from '../../../core/services/shared/exportable.service';
import { Feature, FeatureCollection } from 'geojson';
import { MapService } from '../../../core/services/home/map/map.service';
import { LayersService } from '../../../core/services/home/map/layers.service';
import { GeometryService } from '../../../core/services/home/map/geometry.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-download',
  imports: [CommonModule],
  templateUrl: './download.component.html',
  styleUrl: './download.component.less',
})
export class DownloadComponent implements OnInit {
  optionSearch: any[] = [];
  isVisible: boolean = false;
  selectedOption: string = 'Tipo de Descarga';
  selectedOptionID: number = 0;
  infoSeacher: any[] = [];
  infoClient: any[] = [];
  placeholderText = '';
  dataFilter?: SearchCriteria;
  isLoading: boolean = false;
  geojson!: FeatureCollection;
  idVisor: string = "";

  selections: Record<string, number[]> = {};
  layerNames: string[] = [];

  private readonly visorMap = new Map<string, { workspace: string; centroide: string; entidad: string }>([
    ['1', { workspace: 'POC_Realasset', centroide: 'centroide_zipaquira', entidad: '2' }],
    ['2', { workspace: 'Geovisor-Cajica', centroide: 'centroide_cajica', entidad: '3' }],
    ['3', { workspace: 'Ofertas_Zipaquira', centroide: 'centroide_zipaquira', entidad: '2' }],
    ['4', { workspace: 'Ofertas_Cajica', centroide: 'centroide_cajica', entidad: '3' }]
  ]);

  constructor(
    private readonly downloadSidebarService: DownloadSidebarService,
    private readonly cdr: ChangeDetectorRef,
    private readonly mapService: MapService,
    private readonly exportableService: ExportableService,
    private readonly layersService: LayersService,
    private readonly geometrySvc: GeometryService
  ) {}

  ngOnInit(): void {
    this.idVisor = this.geometrySvc.getIdVisor();
    this.getSearchCriteria();

    this.layersService.changesLayerId$.subscribe((data) => {
      this.selections = {};
      this.layerNames = Object.keys(data);
      for (const layer of this.layerNames) {
        this.selections[layer] = Array.from(data[layer]);
      }
      console.log('id para descargar', this.selections);
    });
  }

  getSearchCriteria(): void {
    this.optionSearch = this.downloadSidebarService.getSearchCriteria();
  }

  clickSearcher(): void {
    this.isVisible = !this.isVisible;
  }

  selectOption(option: any) {
    this.selectedOption = option.label;
    this.selectedOptionID = option.id;
    this.isVisible = false;
  }

  get displayIcon() {
    return this.isVisible ? 'display_down.svg' : 'display_up.svg';
  }

  clearInformation(): void {
    this.infoSeacher = [];
    this.placeholderText = '';
    this.selectedOption = 'Tipo de Descarga';
  }

  private handleCsvOrExcelDownload(
    type: 'csv' | 'excel',
    attributesArray: any[]
  ): void {
    if (this.isLoading) return;
    this.isLoading = true;

    if (attributesArray.length > 0) {
      if (type === 'csv') {
        this.exportableService.exportLargeDataToCsvZip(
          attributesArray,
          'observatorioCSV'
        );
      } else {
        this.exportableService.exportLargeDataToExcelZip(
          attributesArray,
          'observatorioXLSX'
        );
      }
    } else {
      console.error(
        `No se encontraron datos para exportar a ${
          type === 'csv' ? 'CSV' : 'Excel'
        }.`
      );
    }

    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private async buildSelectedGeoJson(): Promise<FeatureCollection> {
    const workspace = 'Geovisor-Zipaquira'; // ajusta según tu backend
    const promises = Object.entries(this.selections).map(
      async ([layerName, ids]) => {
        const features = await firstValueFrom(
          this.geometrySvc.getLayerWFSByIds(workspace, layerName, ids)
        );
        return features;
      }
    );

    const results = (await Promise.all(promises)).filter((f) => !!f);

    return {
      type: 'FeatureCollection',
      features: results.flatMap((fc) => fc.features),
    };
  }

  // private async handleShapefileDownload(): Promise<void> {
  //   if (this.isLoading) return;
  //   this.isLoading = true;
  //   this.cdr.detectChanges();

  //   try {
  //     const geojsonCollection = await this.buildSelectedGeoJson();
  //     console.log('GeoJSON combinado:', geojsonCollection);

  //     if (!geojsonCollection.features.length) {
  //       console.error('No se encontraron datos para exportar a Shapefile.');
  //       return;
  //     }

  //     await this.exportableService.exportToShapefile(
  //       geojsonCollection,
  //       'observatorioShapeFile'
  //     );
  //   } catch (e) {
  //     console.error('Error durante la exportación del Shapefile:', e);
  //   } finally {
  //     this.isLoading = false;
  //     this.cdr.markForCheck();
  //   }
  // }

  private async handleShapefileDownload(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    const cfg = this.getConfigByIndex(this.idVisor);
    console.log('Configuración', cfg)
    if(cfg) {
      try {
        //console.log('IdMapa: ', this.idVisor);
        const workspace = cfg.workspace;//'Geovisor-Zipaquira';
        console.log('workspace', workspace)
        console.log('selections', this.selections)
        // Recorremos capa por capa
        for (const [layerName, ids] of Object.entries(this.selections)) {
          console.log('Layer Name - IDs => ', layerName, ids)
          if (!ids?.length) continue;
  
          const fc = await firstValueFrom(
            this.geometrySvc.getLayerWFSByIds(workspace, layerName, ids)
          );
  
          if (!fc?.features?.length) {
            console.warn(`No se encontraron datos para la capa ${layerName}`);
            continue;
          }
  
          // Exporta un zip independiente por capa
          this.exportableService.exportToShapefile(fc, `${layerName}_ShapeFile`);
        }
      } catch (e) {
        console.error('Error durante la exportación del Shapefile:', e);
      } finally {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    }
  }

  download(): void {
    const geojsonDataArray =
      this.mapService.getDataFiltradaWFS().length > 0
        ? this.mapService.getDataFiltradaWFS()
        : this.mapService.getDataCompletaWFS();

    const attributesArray = geojsonDataArray.map(
      (feature) => feature.properties
    );

    switch (this.selectedOption) {
      case 'Descargar CSV':
        this.handleCsvOrExcelDownload('csv', attributesArray);
        break;
      case 'Descargar Excel':
        this.handleCsvOrExcelDownload('excel', attributesArray);
        break;
      case 'Descargar ShapeFile':
        this.handleShapefileDownload();
        break;
    }
  }

  getInfoClient(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.downloadSidebarService.getInformationClient().subscribe({
      next: (response) => {
        this.infoClient = response.SDT_BaseCliente;
      },
      error: (err) => {
        console.error('Error al generar exportable', err);
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  getInfoClientGeoJson(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.downloadSidebarService.getInformationClientGeoJson().subscribe({
      next: (response) => {
        this.geojson = response.SDT_BaseClienteGeoJson;
      },
      error: (err) => {
        console.error('Error al generar exportable', err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getConfigByIndex(id: string) {
    const config = this.visorMap.get(id);
    if (!config) {
      console.warn(`No existe visor para el id ${id}`);
      return null;
    }
    return config;
  }      

}
