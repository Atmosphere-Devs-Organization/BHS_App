import { MapCoords } from "./MapCoords";

export interface Room {
  roomId: string[];
  floor: number;
  coords: MapCoords;
}
