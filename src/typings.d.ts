// Import Leaflet into L in case you want to reference Leaflet types
import * as L from 'leaflet';

// Declare the leaflet module so we can modify it
declare module 'leaflet' {
    namespace control {
    function coordinates(v: any);
  }
}