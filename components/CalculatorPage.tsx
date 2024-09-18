import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Link, router } from "expo-router";
import { Course } from "@/globalVars/gradesVariables";

const CalculatorPage = ({
  hacBroken,
  courses,
}: {
  hacBroken: boolean;
  courses: Course[] | null | undefined;
}) => {
  const renderCourseItem = ({ item }: { item: Course }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "(screens)/gradesCalculating",
            params: {
              className: item.name,
            },
          })
        }
      >
        <View
          style={{
            margin: 10,
            paddingVertical: 30,
            paddingHorizontal: 20,
            borderWidth: 3,
            borderColor: "#ffffff",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold" }}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return courses ? (
    <View style={{ marginBottom: 330 }}>
      <View>
        <Text style={styles.comingSoonText}>Select a Class</Text>
      </View>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        //horizontal={true}
        contentContainerStyle={{ marginHorizontal: 10 }}
      />
    </View>
  ) : (
    <View>
      <ActivityIndicator
        size="large"
        color="#ff4d00"
        style={{ alignSelf: "center", marginTop: 100 }}
      />
      <Text
        style={{
          color: "#ff4d00",
          alignSelf: "center",
          paddingVertical: 40,
          textAlign: "center",
          paddingHorizontal: 20,
          fontSize: 16,
        }}
      >
        Make sure you are not on school wifi
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  comingSoonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 30,
  },
});

export default CalculatorPage;
