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

const ImageZoom = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const currentRoom = (roomData as Room[]).find((item) =>
    item.roomId.includes(Number(id))
  );

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
        <Image
          source={{ uri: currentRoom?.imageURL }}
          resizeMode="contain"
          style={{
            flex: 1,
            width: "100%",
          }}
        />
      </ReactNativeZoomableView>
    </View>
  );
};

export default ImageZoom;
