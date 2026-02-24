// import { Routes } from '@angular/router';
// import { MapComponent } from './pages/map/map.component';
// import { IdParamsErrorComponent } from './components/errors/id-params-error/id-params-error.component';
// import { sessionIdGuard } from './core/guards/session-id.guard';

// export const routes: Routes = [

//     // { path: '', component:  MapComponent, canActivate: [sessionIdGuard]}, //produccion
//     { path: '', component:  IdParamsErrorComponent}, //pruebas
//     { path: 'error', component:  IdParamsErrorComponent},
//     { path: ':id', component:  MapComponent},

// ];

import { Routes } from '@angular/router';
import { MapComponent } from './pages/map/map.component';
import { IdParamsErrorComponent } from './components/errors/id-params-error/id-params-error.component';
import { sessionIdGuard } from './core/guards/session-id.guard';

export const routes: Routes = [
  // { path: '', component: MapComponent, canActivate: [sessionIdGuard] }, // producción
  { path: '', component: MapComponent }, // pruebas
  { path: 'error', component: IdParamsErrorComponent },
  { path: '**', redirectTo: '' },
];