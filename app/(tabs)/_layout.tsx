import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomTabBar from "@/components/CustomTabBar";

const Layout = () => {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: "Calendar",
          headerTitle: "Calendar",
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          tabBarLabel: "Clubs",
          headerTitle: "Clubs",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          headerTitle: "Map",
        }}
      />
    </Tabs>
  );
};

export default Layout;
