import { Text, SafeAreaView, View, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";
import CustomGradesHeader from "@/components/CustomGradesHeader";
import GradesContent from "@/components/GradesContent";

const Grades = () => {
  const [category, setCategory] = useState("Grades");
  return (
    <View style={styles.BG_Color}>
      <View style={{ flex: 1, marginTop: 190 }}>
        <Stack.Screen
          options={{
            header: () => (
              <CustomGradesHeader onCategoryChanged={setCategory} />
            ),
          }}
        />
        <GradesContent category={category} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  BG_Color: {
    flex: 1,
    backgroundColor: Colors.AmarBackground,
  },
});

export default Grades;
