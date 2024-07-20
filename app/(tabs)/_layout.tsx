import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActiveTint,
        tabBarLabelStyle: { fontFamily: "SpaceMono" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-sharp" size={size} color={color} />
          ),
          headerTitle: "Home",
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-clear-sharp" size={size} color={color} />
          ),
          headerTitle: "Calendar",
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          tabBarLabel: "Clubs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-sharp" size={size} color={color} />
          ),
          headerTitle: "Clubs",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-sharp" size={size} color={color} />
          ),
          headerTitle: "Map",
        }}
      />
    </Tabs>
  );
};

export default Layout;
