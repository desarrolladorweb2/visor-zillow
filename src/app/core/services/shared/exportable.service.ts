import L from 'leaflet';
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as shpwrite from '@mapbox/shp-write';
import JSZip from 'jszip';
import { Feature, FeatureCollection } from 'geojson';
// import { DownloadOptions, ZipOptions, Compression, OutputType } from '@mapbox/shp-write';
import proj4 from 'proj4';
import 'proj4leaflet';

// Definición de la proyección EPSG:9377
// proj4.defs(
//   'EPSG:9377',
//   '+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 ' +
//     '+k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +units=m +no_defs'
// );

proj4.defs(
  'EPSG:9377',
  '+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

// WKT oficial de EPSG:9377
// const EPSG9377_WKT = `
// PROJCS["MAGNA_SIRGAS_Bogota_Zone",GEOGCS["GCS_MAGNA",DATUM["D_MAGNA",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",1000000.0],PARAMETER["False_Northing",1000000.0],PARAMETER["Central_Meridian",-74.0775079166667],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",4.596200416666666],UNIT["Meter",1.0]]
// `.trim();

const EPSG9377_WKT = `PROJCS["MAGNA-SIRGAS / Origen-Nacional",
                GEOGCS["MAGNA-SIRGAS",
                DATUM["Marco_Geocentrico_Nacional_de_Referencia",
                SPHEROID["GRS 1980",6378137,298.257222101,
                AUTHORITY["EPSG","7019"]],
                TOWGS84[0,0,0,0,0,0,0],
                AUTHORITY["EPSG","6686"]],
                PRIMEM["Greenwich",0,
                AUTHORITY["EPSG","8901"]],
                UNIT["degree",0.0174532925199433,
                AUTHORITY["EPSG","9122"]],
                AUTHORITY["EPSG","4686"]],
                PROJECTION["Transverse_Mercator"],
                PARAMETER["latitude_of_origin",4.0],
                PARAMETER["central_meridian",-73.0],
                PARAMETER["scale_factor",0.9992],
                PARAMETER["false_easting",5000000],
                PARAMETER["false_northing",2000000],
                UNIT["metre",1,
                AUTHORITY["EPSG","9001"]],
                AUTHORITY["EPSG","9377"]]`.trim();

@Injectable({
  providedIn: 'root',
})
export class ExportableService {

    private readonly reprojectCoord = (
    from: string,
    to: string,
    coord: number[]
  ): number[] => proj4(from, to, coord);

  private readonly reprojectRing = (
    from: string,
    to: string,
    ring: number[][]
  ): number[][] => ring.map((c) => this.reprojectCoord(from, to, c));

  private readonly reprojectPolygon = (
    from: string,
    to: string,
    poly: number[][][]
  ): number[][][] => poly.map((ring) => this.reprojectRing(from, to, ring));

  constructor() {}

  // EXPORTAR CSV
  public exportToCSV(data: any[], filename: string): void {
    if (!data?.length) {
      return;
    }

    const separator = ',';
    const keys = Object.keys(data[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      data
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] ?? '';
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replacAll(/"/g, '""');
              if (cell.search(/["|,\n]/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  public exportLargeDataToCsvZip(data: any[], filenameBase: string): void {
    const chunkSize = 50000;
    const zip = new JSZip();

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const csvContent = this.convertToCsv(chunk);
      zip.file(`${filenameBase}_${i / chunkSize + 1}.csv`, csvContent);
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${filenameBase}.zip`);
    });
  }

  private convertToCsv(data: any[]): string {
    if (!data?.length) {
      return '';
    }

    const separator = ',';
    const keys = Object.keys(data[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      data
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] ?? '';
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replaceAll('"', '');
              if (cell.search(/["|,\n]/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    return csvContent;
  }

  // EXPORTAR EXCEL
  public exportToExcel(data: any[], filename: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const dataBlob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(dataBlob, `${filename}.xlsx`);
  }

  public exportLargeDataToExcelZip(data: any[], filenameBase: string): void {
    const chunkSize = 50000;
    const zip = new JSZip();

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(chunk);
      const workbook: XLSX.WorkBook = {
        Sheets: { data: worksheet },
        SheetNames: ['data'],
      };
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      zip.file(`${filenameBase}_${i / chunkSize + 1}.xlsx`, excelBuffer);
    }

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
      saveAs(content, `${filenameBase}.zip`);
    });
  }

  // EXPORTAR SHAPEFILE

  // public exportToShapefile(
  //   geoJsonPuntos: FeatureCollection,
  //   name: string
  // ): void {
  //   const filename = name;
  //   const options: DownloadOptions & ZipOptions = {
  //     folder: filename,
  //     types: {
  //       point: filename,
  //     },
  //     compression: 'DEFLATE' as Compression,
  //     outputType: 'blob' as OutputType,
  //   };

  //   shpwrite.download(geoJsonPuntos, options);
  // }


   public async exportToShapefile(
    geojson: FeatureCollection,
    name: string
  ): Promise<void> {
    if (!geojson?.features?.length) {
      console.error('El GeoJSON está vacío, no se puede exportar.');
      return;
    }

    const geomType = geojson.features[0].geometry?.type ?? 'Point';
    let shpType: 'point' | 'polygon' | 'line' = 'point';
    if (geomType.includes('Polygon')) shpType = 'polygon';
    else if (geomType.includes('Line')) shpType = 'line';

    const chunkSize = 30000;
    const totalChunks = Math.ceil(geojson.features.length / chunkSize);

    const finalZip = new JSZip();

    for (let i = 0; i < totalChunks; i++) {
      await this.processShapefileChunk(
        geojson,
        name,
        shpType,
        i,
        chunkSize,
        finalZip
      );
      // Liberar el thread para evitar congelamiento
      await new Promise((res) => setTimeout(res, 0));
    }

    const zipBlob = await finalZip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${name}_shapefiles.zip`);
  }

  private async processShapefileChunk(
    geojson: FeatureCollection,
    name: string,
    shpType: 'point' | 'polygon' | 'line',
    chunkIndex: number,
    chunkSize: number,
    finalZip: JSZip
  ): Promise<void> {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, geojson.features.length);
    const chunkFeatures = geojson.features.slice(start, end);

    const reprojected = this.reprojectGeoJSON({
      type: 'FeatureCollection',
      features: chunkFeatures,
    });

    const blob = (await shpwrite.zip(reprojected, {
      types: { [shpType]: `${name}_${chunkIndex + 1}` },
      compression: 'DEFLATE',
      outputType: 'blob',
    })) as Blob;

    const buffer = await blob.arrayBuffer();
    const subZip = await JSZip.loadAsync(buffer);

    for (const fileName of Object.keys(subZip.files)) {
      const ext = fileName.split('.').pop();
      if (!ext) continue;

      let newFileName = `${name}_${chunkIndex + 1}.${ext.toLowerCase()}`;

      if (ext.toLowerCase() === 'prj') {
        finalZip.file(newFileName, EPSG9377_WKT.trim());
      } else {
        const fileData = await subZip.file(fileName)?.async('arraybuffer');
        if (fileData) {
          finalZip.file(newFileName, fileData);
        }
      }
    }
  }

  private reprojectGeoJSON(fc: FeatureCollection): FeatureCollection {
    // Uso de las definiciones globales
    const fromCRS = 'EPSG:4326';
    const toCRS = 'EPSG:9377';

    const newFeatures: Feature[] = fc.features.map((f) => {
      return this.reprojectFeature(f, fromCRS, toCRS); // Llama a la lógica de reproyección
    });

    return { ...fc, features: newFeatures };
  }

  // ⚠️ Esta función auxiliar de la respuesta anterior debe estar en tu clase
  private reprojectFeature(
    feature: Feature,
    from: string,
    to: string
  ): Feature {
    const geom = feature.geometry;
    if (!geom) return feature;

    if (geom.type === 'GeometryCollection') {
      return feature;
    }

    const newGeom = { ...geom };

    switch (geom.type) {
      case 'Point':
        // Asume que las coordenadas son un array de números, no un array de arrays
        if (
          Array.isArray(geom.coordinates) &&
          typeof geom.coordinates[0] === 'number'
        ) {
          newGeom.coordinates = this.reprojectCoord(
            from,
            to,
            geom.coordinates as number[]
          );
        }
        break;

      case 'LineString':
      case 'MultiPoint':
        newGeom.coordinates = (geom.coordinates as number[][]).map((c) =>
          this.reprojectCoord(from, to, c)
        );
        break;

      case 'Polygon':
      case 'MultiLineString':
        newGeom.coordinates = (geom.coordinates as number[][][]).map((ring) =>
          this.reprojectRing(from, to, ring)
        );
        break;

      case 'MultiPolygon':
        newGeom.coordinates = (geom.coordinates as number[][][][]).map((poly) =>
          this.reprojectPolygon(from, to, poly)
        );
        break;
    }

    return { ...feature, geometry: newGeom };
  }


  public exportMultiplePointsAsZip(geoJsonPuntos: FeatureCollection): void {
    const filename = 'puntos_exportados';
    // @ts-ignore: zip no está tipado completamente
    const buffer: ArrayBuffer = shpwrite.zip(geoJsonPuntos, {
      types: { point: filename },
    });
    const blob = new Blob([buffer], { type: 'application/zip' });
    saveAs(blob, `${filename}.zip`);
  }
}
