export type GeoJsonGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export interface Geometry {
  coordinates: number[]; 
  type: GeoJsonGeometryType;
}

export interface Properties {
  Direccion_Id: string;
}

export interface Feature {
  geometry: Geometry;
  properties: Properties;
  type: "Feature";
}

export interface GeoJson {
  type: "FeatureCollection";
  features: Feature[];
}

export interface GeoJsonData {
  SDT_GeoJson: GeoJson;
}

export interface GeoJsonDataBaseCliente {
  SDT_BaseClienteGeoJson: GeoJson;
}
