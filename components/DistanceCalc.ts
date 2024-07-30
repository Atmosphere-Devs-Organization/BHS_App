import { MapCoords } from "@/interfaces/MapCoords";

export const distance = (pos1: MapCoords, pos2: MapCoords): number => {
  return Math.sqrt(
    Math.pow(pos1.Col - pos2.Col, 2) + Math.pow(pos1.Row - pos2.Row, 2)
  );
};
