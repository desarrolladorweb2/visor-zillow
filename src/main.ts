import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// src/polyfills.ts (o src/main.ts)
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import L from 'leaflet';
import 'leaflet.markercluster';

import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// 2) Regístralos todos de una vez
Chart.register(
  ArcElement,        // para Pie/Doughnut :contentReference[oaicite:0]{index=0}
  BarElement,        // para Bar :contentReference[oaicite:1]{index=1}
  LineElement,       // para Line :contentReference[oaicite:2]{index=2}
  PointElement,      // nodos de la línea :contentReference[oaicite:3]{index=3}
  CategoryScale,     // eje X de categorías :contentReference[oaicite:4]{index=4}
  LinearScale,       // eje Y lineal :contentReference[oaicite:5]{index=5}
  Title, Tooltip, Legend  // para títulos, tooltips y leyenda :contentReference[oaicite:6]{index=6}
);


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
