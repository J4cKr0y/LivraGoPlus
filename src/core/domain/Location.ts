export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface Address {
  fullText: string;
  street?: string;
  city?: string;
  zipCode?: string;
  coordinates?: GeoCoordinate; // Optionnel car l'OCR ne donne pas la lat/long
}
