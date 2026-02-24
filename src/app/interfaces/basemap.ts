export interface Basemap {
  id: number;
  mapa: string;
  label: string;
  url: string;
  predefinido: boolean;
  subdomains?: string[];
  maxar?: boolean;
  atribucion?: string;
  key?: string; //
}
