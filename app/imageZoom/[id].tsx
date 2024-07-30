import {
  Animated,
  Image,
  ImageBackground,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import roomData from "@/assets/data/map-data.json";
import { Room } from "@/interfaces/Room";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { Ionicons } from "@expo/vector-icons";
import GridMap from "@/components/GridMap";

const ImageZoom = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const params = id ? id.split(",") : [];

  const startPosCol = Number(params[0]);
  const startPosRow = Number(params[1]);
  const endPosCol = Number(params[2]);
  const endPosRow = Number(params[3]);
  const floor = Number(params[4]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <TouchableOpacity onPress={router.back} style={{ padding: 30 }}>
        <Ionicons name="close-sharp" size={40} color="white" />
      </TouchableOpacity>
      <ReactNativeZoomableView
        maxZoom={4}
        minZoom={1}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        style={{
          flex: 1,
          backgroundColor: "#000",
        }}
      >
        <GridMap
          startPos={{ Col: startPosCol, Row: startPosRow }}
          endPos={{ Col: endPosCol, Row: endPosRow }}
          floor={floor}
          paddingHorizontal={15}
        />
      </ReactNativeZoomableView>
    </View>
  );
};

export default ImageZoom;
