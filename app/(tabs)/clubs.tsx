import { View, ImageBackground, StyleSheet } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack } from "expo-router";
import ClubsHeader from "@/components/ClubsHeader";
import ClubList from "@/components/ClubList";
import clubData from "@/assets/data/clubs-data.json";
import Colors from "@/constants/Colors";

const Clubs = () => {
  const [category, setCategory] = useState("All");
  const items = useMemo(() => clubData as any, []);

  const onCategoryChanged = (category: string) => {
    setCategory(category);
  };
  return (
    <View style={styles.BG_Color}>
      <View style={{ flex: 1, marginTop: 190 }}>
        <Stack.Screen
          options={{
            header: () => <ClubsHeader onCategoryChanged={onCategoryChanged} />,
          }}
        />
        <ClubList category={category} clubs={items} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
  },
  BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
  },
});

export default Clubs;
