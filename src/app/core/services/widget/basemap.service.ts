import { Injectable } from '@angular/core';
import { Basemap } from '../../../interfaces/basemap';


@Injectable({
  providedIn: 'root'
})
export class BasemapService {

  getBasemaps(): Basemap[] {
    return [
      //{ id: 1, mapa: 'cartografico', label: 'Estándar', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', predefinido: true, subdomains: ['a', 'b', 'c'], maxar: false, atribucion: '© OpenStreetMap contributors' },
      //{ id: 1, mapa: 'cartografico', label: 'Estándar', url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x.png', predefinido: true, subdomains: [], maxar: false, atribucion: '© OpenStreetMap contributors' },
      { id: 1, mapa: 'satelital', label: 'Satelital', url: 'https://api.maxar.com/streaming/v1/ogc/wms?', predefinido: true, subdomains: [], maxar: true, atribucion: '© Maxar Technologies' },
      //{ id: 4, mapa: 'cartografico', label: 'Cartográfico', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', predefinido: false, subdomains: ['a', 'b', 'c', 'd'], maxar: false, atribucion: '© OpenStreetMap contributors © CARTO' },
      //{ id: 5, mapa: 'carto_oscuro', label: 'Carto Oscuro', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', predefinido: false, subdomains: ['a', 'b', 'c', 'd'], maxar: false, atribucion: '© OpenStreetMap contributors © CARTO' },
      //{ id: 6, mapa: 'mde', label: 'MDE', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', predefinido: false, subdomains: ['a','b','c'], maxar: false, atribucion: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)' },
    ];
  }
}
