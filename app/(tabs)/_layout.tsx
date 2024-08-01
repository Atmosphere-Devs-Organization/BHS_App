import React from "react";
import { Tabs } from "expo-router";
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
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          tabBarLabel: "Clubs",
          headerTitle: "Clubs",
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          headerTitle: "Map",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          tabBarLabel: "Grades",
          headerTitle: "Grades",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default Layout;
