import { Injectable } from '@angular/core';
import { SideBar } from '../../../interfaces/sidebar';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor() { }

  getSideBar(): SideBar[] {
    return [
      { image: 'sidebar_layer', type: 'dark', id: 1, label: 'Capas', allow: ['Administrator', 'Consulta', 'Editor'] },
      { image: 'sidebar_search', type: 'dark', id: 2, label: 'Búsqueda', allow: ['Administrator', 'Consulta', 'Editor'] },
      { image: 'sidebar_download', type: 'dark', id: 3, label: 'Descargas', allow: ['Administrator', 'Consulta', 'Editor'] },
      { image: 'sidebar_add_layer', type: 'dark', id: 4, label: 'Cargar Shapefile', allow: ['Administrator', 'Consulta', 'Editor'] },
    ];
  }
}
