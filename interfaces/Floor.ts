import { MapCoords } from "./MapCoords";
import { Stair } from "./Stair";

export interface Floor {
  id: number;
  gridWidth: number;
  gridHeight: number;
  walls: MapCoords[];
  stairs: Stair[];
  elevators: MapCoords[];
  imageURL: string;
}
