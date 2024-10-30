import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

  return (
    <View style={{ marginTop: 250 }}>
      <View>
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
      </View>
      {/*}
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        //horizontal={true}
        contentContainerStyle={{ marginHorizontal: 10 }}
      />
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  comingSoonText: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 30,
  },
});

export default CalculatorPage;
