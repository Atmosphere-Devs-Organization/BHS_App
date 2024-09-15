import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Course } from "@/globalVars/gradesVariables";

const CalculatorPage = ({
  hacBroken,
  courses,
}: {
  hacBroken: boolean;
  courses: Course[] | null | undefined;
}) => {
  return (
    <Link
      href={{
        pathname: "(screens)/gradesCalculating",
        params: { className: "U S Govt AP" },
      }}
      asChild
    >
      <Text style={styles.comingSoonText}>Click Here</Text>
    </Link>
  );
  // return (
  //   <Text style={styles.comingSoonText}>Calculator Coming Very Soon!</Text>
  // );
};

const styles = StyleSheet.create({
  comingSoonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 60,
  },
});

export default CalculatorPage;
