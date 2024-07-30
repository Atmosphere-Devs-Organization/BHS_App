import Colors from "@/constants/Colors";
import { MapCoords } from "@/interfaces/MapCoords";
import React, { useMemo, useState } from "react";
import { View, StyleSheet, Dimensions, ImageBackground } from "react-native";
import { Svg, Rect, Line } from "react-native-svg";
import floorData from "@/assets/data/floor-data.json";
import { Floor } from "@/interfaces/Floor";
import Numbers from "@/constants/Numbers";

interface Props {
  startPos: MapCoords;
  endPos: MapCoords;
  floor: number;
  paddingHorizontal: number;
}

const GridMap = ({ startPos, endPos, floor, paddingHorizontal }: Props) => {
  var PF = require("pathfinding");

  const floor_data = useMemo(() => floorData as any, []); // More efficient, idk what it does tbh
  const floorItem = (floor_data as Floor[]).find((item) => item.id === floor);

  const GRID_WIDTH = floorItem ? floorItem.gridWidth : 1;
  const GRID_HEIGHT = floorItem ? floorItem.gridHeight : 1;
  const WALLS = floorItem ? floorItem.walls : [];

  const CELL_SIZE =
    GRID_WIDTH && GRID_HEIGHT
      ? Math.min(
          (Dimensions.get("window").width - paddingHorizontal * 2) / GRID_WIDTH,
          Dimensions.get("window").height / GRID_HEIGHT
        )
      : 0;

  let grid = new PF.Grid(GRID_WIDTH, GRID_HEIGHT);
  for (let i = 0; i < WALLS.length; i++) {
    if (
      !(startPos.Col === WALLS[i].Col && startPos.Row === WALLS[i].Row) &&
      !(endPos.Col === WALLS[i].Col && endPos.Row === WALLS[i].Row)
    ) {
      grid.setWalkableAt(WALLS[i].Col, WALLS[i].Row, false);
    }
  }

  const [path, setPath] = useState<number[][]>([]);

  const drawGrid = () => {
    let elements = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        elements.push(
          <Rect
            key={`${x}-${y}`}
            x={x * CELL_SIZE}
            y={y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={
              x === endPos.Col && y === endPos.Row
                ? Colors.target
                : x === startPos.Col && y === startPos.Row
                ? Colors.start
                : grid.isWalkableAt(x, y)
                ? Colors.walkable
                : Colors.walls
            }
            stroke={Colors.cellBorder}
            strokeWidth={Numbers.cellBorderWidth}
          />
        );
      }
    }
    return elements;
  };

  const drawPath = () => {
    let elements = [];
    for (let i = 0; i < path.length - 1; i++) {
      let [x1, y1] = path[i];
      let [x2, y2] = path[i + 1];
      elements.push(
        <Line
          key={`${x1}-${y1}-${x2}-${y2}`}
          x1={x1 * CELL_SIZE + CELL_SIZE / 2}
          y1={y1 * CELL_SIZE + CELL_SIZE / 2}
          x2={x2 * CELL_SIZE + CELL_SIZE / 2}
          y2={y2 * CELL_SIZE + CELL_SIZE / 2}
          stroke="green"
          strokeWidth={Numbers.pathWidth}
        />
      );
    }
    return elements;
  };

  const findPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    // grid = new PF.Grid(GRID_WIDTH, GRID_HEIGHT);

    // for (let i = 0; i < WALLS.length; i++) {
    //   grid.setWalkableAt(WALLS[i].Col, WALLS[i].Row, false);
    // }

    const finder = new PF.BreadthFirstFinder();
    const newPath = finder.findPath(startX, startY, endX, endY, grid.clone());
    setPath(newPath);
  };

  React.useEffect(() => {
    findPath(startPos.Col, startPos.Row, endPos.Col, endPos.Row);
  }, [floor, startPos, endPos]);

  return (
    <ImageBackground
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 15,
        borderWidth: 5,
        borderColor: Colors.mapBorder,
        marginHorizontal: paddingHorizontal / 1.5,
      }}
      source={{ uri: floorItem?.imageURL }}
      resizeMode="contain"
    >
      <Svg height={GRID_HEIGHT * CELL_SIZE} width={GRID_WIDTH * CELL_SIZE}>
        {drawGrid()}
        {drawPath()}
      </Svg>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({});

export default GridMap;
