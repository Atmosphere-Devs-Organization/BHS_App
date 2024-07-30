import { MapCoords } from "./MapCoords";

export interface Stair {
  id: string;
  coords: MapCoords;
  accessibleFloors: number[];
}
