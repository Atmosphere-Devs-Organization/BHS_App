import { View, Text, StyleSheet } from "react-native";
import React from "react";

const CalculatorPage = () => {
  return <Text style={styles.comingSoonText}>Calculator Coming Soon</Text>;
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
