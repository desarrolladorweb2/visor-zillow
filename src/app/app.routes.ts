import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { IdParamsErrorComponent } from './components/errors/id-params-error/id-params-error.component';
import { ListadoSolicitudesComponent } from './components/listado-solicitudes/listado-solicitudes.component';


export const routes: Routes = [
  { path: '', component: MapComponent }, // para geovisor
  { path: 'listado-solicitudes', component: ListadoSolicitudesComponent }, // para listado de solicitudes del geovisor
  { path: 'error', component: IdParamsErrorComponent },
  // { path: '**', redirectTo: '' },
];
