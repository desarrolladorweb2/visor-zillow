import L from 'leaflet';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { WmsParams } from '../../../../interfaces/wmsParams';
import 'proj4';
import 'proj4leaflet';
import { FeatureCollection } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class GeometryService {
  private readonly apiUrl = environment.backendGN;
  private readonly geoServerUrl = environment.geoserverURL;
  private readonly headers = new HttpHeaders();
  public idVisor!: string;

  private readonly crs9377 = new (L as any).Proj.CRS(
    'EPSG:9377',
    '+proj=tmerc +lat_0=4 +lon_0=-73.08333333333333 ' +
    '+k=1 +x_0=1000000 +y_0=1000000 ' +
    '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      resolutions: [
        8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1,
      ],
      origin: [0, 0],
    }
  );

  constructor(private readonly http: HttpClient) { }

  getGeoJsonData(
    north: number,
    south: number,
    east: number,
    west: number
  ): Observable<any> {
    const url = `${this.apiUrl}/WS_GeoJsonSP`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const params = {
      Gx_mode: 'DSP',
      norte: north,
      sur: south,
      este: east,
      oeste: west,
    };
    return this.http.post<any>(url, params, { headers });
  }

  setIdVisor(idVisor: string) {
    this.idVisor = idVisor;
  }

  getIdVisor() {
    return this.idVisor;
  }

  getLayer(layer: string): Observable<any> {
    const url =
      this.geoServerUrl +
      'ows?service=wfs&request=GetFeature&typeName=' +
      layer +
      '&outputFormat=application/json';
    const header = this.headers.append('Content-Type', 'application/json');

    const httpOptions = {
      headers: header,
    };
    return this.http
      .get<any>(url, httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }

  getLayerWFS_(
    workSpace: string,
    layer: string,
    bbox?: L.LatLngBounds
  ): Observable<any[] | null> {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: `${workSpace}:${layer}`,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326'//'EPSG:9377',
    });

    if (bbox) {
      // bounds en EPSG:4326
      const sw = bbox.getSouthWest();
      const ne = bbox.getNorthEast();

      // reproyectar a EPSG:9377
      const sw9377 = this.crs9377.project(sw);
      const ne9377 = this.crs9377.project(ne);

      params.set(
        'bbox',
        `${sw9377.x},${sw9377.y},${ne9377.x},${ne9377.y},EPSG:9377`
      );
    }

    const url = `${this.geoServerUrl}wfs?${params.toString()}`;
    return this.http.get<any>(url).pipe(
      map((response) => (response.features?.length ? response.features : null)),
      catchError((error) => {
        console.error('Error al obtener la capa WFS:', error);
        return of(null);
      })
    );
  }

  getLayersByIdVisor(): WmsParams[] {
    const allLayers: WmsParams[] = [
      // {
      //   idVisor: '1',
      //   workspace: 'POC_Realasset',
      //   layerName: 'cr_terrenos',
      //   labelName: 'Terrenos',
      //   format: 'image/png',
      //   opacity: 90,
      //   visible: false,
      //   type: 'interactive',
      // },
      {
        idVisor: '1',
        workspace: 'POC_Realasset',
        layerName: 'ubicacion',
        labelName: 'Ubicación',
        format: 'image/png',
        opacity: 90,
        visible: true,
        type: 'interactive',
      },
      // {
      //   idVisor: '1',
      //   workspace: 'Geovisor-Zipaquira',
      //   layerName: 'cc_limite_municipio',
      //   labelName: 'Límite Municipio',
      //   format: 'image/png',
      //   opacity: 90,
      //   visible: false,
      //   type: 'bulk',
      // },
      {
        idVisor: '2',
        workspace: 'Geovisor-Cajica',
        layerName: 'cr_terrenos',
        labelName: 'Terrenos',
        format: 'image/png',
        opacity: 90,
        visible: false,
        type: 'interactive',
      },
      {
        idVisor: '2',
        workspace: 'Geovisor-Cajica',
        layerName: 'cr_unidadesconstruccion',
        labelName: 'Unidades de Construcción',
        format: 'image/png',
        opacity: 90,
        visible: false,
        type: 'interactive',
      },
      {
        idVisor: '3',
        workspace: 'Ofertas_Zipaquira',
        layerName: 'cr_terrenos',
        labelName: 'Ofertas OIM',
        format: 'image/png',
        opacity: 90,
        visible: false,
        type: 'interactive',
      },
      {
        idVisor: '4',
        workspace: 'Ofertas_Cajica',
        layerName: 'cr_terrenos',
        labelName: 'Ofertas OIM',
        format: 'image/png',
        opacity: 90,
        visible: false,
        type: 'interactive',
      }
    ];

    // Retorna solo las capas con idVisor coincidente
    return allLayers.filter(layer => layer.idVisor === this.idVisor);
  }


  getAllLayersConfig2(): WmsParams[] {
    return [
      {
        idVisor: '1',
        workspace: 'Geovisor-Zipaquira',
        layerName: 'cr_terrenos',
        labelName: 'Terrenos',
        format: 'image/png',
        opacity: 90,
        visible: true,
        type: 'interactive',
      },
      {
        idVisor: '1',
        workspace: 'Geovisor-Zipaquira',
        layerName: 'cr_unidadesconstruccion',
        labelName: 'Unidades de Construcción',
        format: 'image/png',
        opacity: 90,
        visible: true,
        type: 'interactive',
      }
    ];
  }

  getWMSLayersParams(config: WmsParams) {
    const params = {
      layers: config.workspace + ':' + config.layerName,
      format: 'image/png8',
      transparent: true,
      version: '1.1.1',
      attribution: '',
      maxZoom: 22,
    };

    return params;
  }

  getWMSLayersURL(wSpace: string) {
    const geoserverUrl = this.geoServerUrl + wSpace + '/wms';
    return geoserverUrl;
  }

  handleError(error: {
    error: { message: string };
    status: any;
    message: any;
  }) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Codigo Error (API Geoserver): ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => errorMessage);
  }

  getWMSLayersURLFiltered(feature: string, value: string) {
    const geoserverUrl =
      this.geoServerUrl +
      'Observatorio_Inmobiliario/wms?&request=GetMap&CQL_FILTER=' +
      feature +
      '=%27' +
      value +
      '%27';
    return geoserverUrl;
  }

  getLayerWFSByIds(workspace: string, layerName: string, ids: number[]) {
    if (!ids?.length) return of(null);

    //const idField =
    //layerName === 'cr_terrenos' ? 'predio_id' : 'cr_unidadesconstruccion_id';
    //layerName === 'cr_terrenos' ? 'predio_id' : 'cr_unidadesconstruccion_id';

    let idField: string;

    if (layerName === 'cr_terrenos') {
      idField = 'predio_id';
    } else if (layerName === 'ubicacion') {
      idField = 'ubicacion_id';
    } else {
      idField = 'cr_unidadesconstruccion_id'; // valor por defecto
    }

    const cql = `${idField} IN (${ids.join(',')})`;

    const url =
      `${this.geoServerUrl}wfs?service=WFS&version=1.1.0&request=GetFeature` +
      `&typename=${workspace}:${layerName}` +
      //`&srsName=EPSG:9377` + 
      `&srsName=EPSG:4326` +
      `&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cql)}`;

    return this.http.get<FeatureCollection>(url);
  }

  async getFeatureWFS(
    workSpace: string,
    layer: string,
    map: L.Map,
    latlng: L.LatLng
  ): Promise<any> {

    const bounds = map.getBounds();
    const size = map.getSize();
    const point = map.latLngToContainerPoint(latlng);

    console.log('Bounds: ', bounds, 'Size: ', size, 'Point: ', point)

    const x = Math.round(point.x);
    const y = Math.round(point.y);

    // Validar coordenadas
    if (x < 0 || x > size.x || y < 0 || y > size.y) {
      console.warn('Coordenadas fuera del rango visible del mapa:', {
        x,
        y,
        width: size.x,
        height: size.y,
      });
      return null;
    }

    const params: Record<string, string> = {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetFeatureInfo',
      layers: `${workSpace}:${layer}`,
      query_layers: `${workSpace}:${layer}`,
      outputFormat: 'application/json',
      info_format: 'application/json',
      srs: 'EPSG:4326',
      bbox: bounds.toBBoxString(),
      width: size.x.toString(),
      height: size.y.toString(),
      x: x.toString(),
      y: y.toString(),
    };

    // const params: Record<string, string> = {
    //   service: 'WFS',
    //   version: '1.1.0',
    //   request: 'GetFeature',
    //   typeName: `${workSpace}:${layer}`,
    //   outputFormat: 'application/json',
    //   srsName: 'EPSG:4326',
    //   bbox: `${bbox},EPSG:4326`
    // };

    const geoserverUrl = this.geoServerUrl + 'wms';
    const url = `${geoserverUrl}?${new URLSearchParams(params)}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      if (response.features && response.features.length > 0) {
        return response.features[0];
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el objeto espacial (WMS):', error);
      throw error;
    }
  }

  // async getCenterOfPolygons(
  //   workSpace: string,
  //   layer: string,
  //   //feature: string,
  //   //value: string
  // ): Promise<L.LatLng | null> {
  //   //const isNumeric = typeof value === 'number' || !isNaN(Number(value));
  //   //const filter = isNumeric ? `${feature}=${value}` : `${feature}='${value}'`;

  //   const params: any = {
  //     service: 'WFS',
  //     version: '1.1.0',
  //     request: 'GetFeature',
  //     typeName: `${workSpace}:${layer}`,
  //     outputFormat: 'application/json',
  //     srsName: 'EPSG:4326',
  //     //CQL_FILTER: filter,
  //   };

  //   const geoserverUrl = `${this.geoServerUrl}wfs`;
  //   const url = `${geoserverUrl}?${new URLSearchParams(params)}`;

  //   try {
  //     const response: any = await firstValueFrom(this.http.get(url));

  //     if (!response.features || response.features.length === 0) {
  //       console.warn('No se encontraron polígonos para el filtro especificado');
  //       return null;
  //     }

  //     // Obtener todos los centroides individuales
  //     const centroids = response.features
  //       .map((f: any) => {
  //         if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
  //           const coords = this.getPolygonCentroid(f.geometry);
  //           return coords;
  //         }
  //         return null;
  //       })
  //       .filter((c: any) => c !== null);

  //     if (centroids.length === 0) return null;

  //     const avgLat =
  //       centroids.reduce((sum: number, c: L.LatLng) => sum + c.lat, 0) / centroids.length;
  //     const avgLng =
  //       centroids.reduce((sum: number, c: L.LatLng) => sum + c.lng, 0) / centroids.length;

  //     return L.latLng(avgLat, avgLng);
  //   } catch (error) {
  //     console.error('Error al calcular el centro de los polígonos:', error);
  //     return null;
  //   }
  // }

  // private getPolygonCentroid(geometry: any): L.LatLng {
  //   let coords: number[][] = [];

  //   if (geometry.type === 'Polygon') {
  //     coords = geometry.coordinates[0];
  //   } else if (geometry.type === 'MultiPolygon') {
  //     coords = geometry.coordinates[0][0];
  //   }

  //   let x = 0,
  //     y = 0;
  //   const len = coords.length;
  //   for (let i = 0; i < len; i++) {
  //     x += coords[i][0];
  //     y += coords[i][1];
  //   }

  //   return L.latLng(y / len, x / len);
  // }

  async getCenterOfPolygons(workSpace: string, viewName: string, municipio?: string): Promise<L.LatLng | null> {
    const params: any = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: `${workSpace}:${viewName}`,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
    };

    // Si tiene parámetro
    if (municipio) {
      params.viewparams = `municipio:${municipio}`;
    }

    const url = `${this.geoServerUrl}wfs?${new URLSearchParams(params)}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      if (response.features?.length > 0) {
        const [lng, lat] = response.features[0].geometry.coordinates;
        return L.latLng(lat, lng);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el centroide desde GeoServer:', error);
      return null;
    }
  }

  async getLayerWMS(workSpace: string, layer: string) {
    const params = {
      layers: workSpace + ':' + layer,
      format: "image/png",
      transparent: true,
      version: '1.1.1',
      attribution: "",
      maxZoom: 22,
      //tiled: true,
      //zIndex: -1,
      //opacity: 0.7,
    };

    //const geoServer: string = 'http://50.16.106.18:8080/geoserver/'
    const geosvrUrl = this.geoServerUrl + workSpace + "/wms?&request=GetMap";
    //const geosvrUrl = this.geoServerUrl + workSpace + "/gwc/service/?&request=GetMap";
    //const geosvrUrl = geoServer + workSpace + "/wms?&request=GetMap";

    try {
      const response: any = L.tileLayer.wms(geosvrUrl, params);
      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener la capa espacial (WMS):', error);
      throw error;
    }
  }

}
