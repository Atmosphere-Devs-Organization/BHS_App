import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import CustomGradesHeader from "@/components/CustomGradesHeader";
import GradesContent from "@/components/GradesContent";

const Grades = () => {
  const [category, setCategory] = useState("Grades");
  return (
    <View style={styles.BG_Color}>
      <Stack.Screen
        options={{
          header: () => <CustomGradesHeader onCategoryChanged={setCategory} />,
        }}
      />
      <View style={{ flex: 1, marginTop: 180 }}>
        <GradesContent category={category} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
  },
});

export default Grades;
