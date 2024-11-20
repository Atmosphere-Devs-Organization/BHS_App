import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Colors from "@/constants/Colors";

const CalculatorPage = ({ hacBroken, courses }: { hacBroken: boolean; courses: any[] | null | undefined }) => {
  const [gp1Avg, setGp1Avg] = useState("");
  const [gp2Avg, setGp2Avg] = useState("");
  const [finalGrade, setFinalGrade] = useState<number | undefined>(0);
  const [desiredGrade, setDesiredGrade] = useState("");

  const calculateFinalGrade = () => {
    const GP1 = parseFloat(gp1Avg);
    const GP2 = parseFloat(gp2Avg);
    const targetGrade = parseFloat(desiredGrade);

    if (isNaN(GP1) || isNaN(GP2) || isNaN(targetGrade)) {
      Alert.alert("Invalid Input", "Please fill out all fields");
      return undefined; // Handle invalid input
    }

    // Formula: (GP1 * 3) + (GP2 * 3) + FINAL = Semester Average
    const requiredFinal = ((targetGrade - 0.5) * 7) - (GP1 * 3) - (GP2 * 3);

    // Round to the nearest whole number
    return Math.round(requiredFinal);
  };

  useEffect(() => {
    const updatedFinalGrade = calculateFinalGrade();
    if (updatedFinalGrade !== undefined) {
      setFinalGrade(updatedFinalGrade);
    } else {
      setFinalGrade(undefined); // Reset final grade if calculation fails
    }
  }, [gp1Avg, gp2Avg, desiredGrade]);

  return (
    <View style={{ marginTop: 20, padding: 20 }}>
<View style={styles.card}>
      <Text style={styles.headerText}>Finals Calculator</Text>
      <Text style={styles.comingSoonText}>Grading Period Averages</Text>

      <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 40, marginTop: 35}}>
        {/* GP1 and GP2 Averages Input */}
        <TextInput
          style={[styles.input, {flex: 1, marginRight: 10}]}
          placeholder="GP1 Average"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={gp1Avg}
          onChangeText={setGp1Avg}
        />
        <TextInput
          style={[styles.input, {flex: 1}]}
          placeholder="GP2 Average"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={gp2Avg}
          onChangeText={setGp2Avg}
        />
      </View>


      {/* Desired Grade Selection */}
      <Text style={styles.comingSoonText}>Desired Semester Average</Text>
      <View style={styles.gradeButtons}>
        {["90", "80", "70"].map((grade) => {
          const isSelected = desiredGrade === grade;
          let backgroundColor = isSelected
            ? grade === "90"
              ? Colors.courseGradeAColor
              : grade === "80"
              ? Colors.courseGradeBColor
              : Colors.courseGradeCColor
            : "#494547";

          return (
            <TouchableOpacity
              key={grade}
              onPress={() => setDesiredGrade(grade)}
              style={[
                styles.button,
                isSelected && styles.selectedButton,
                { backgroundColor },
              ]}
            >
              <Text style={styles.buttonText}>{grade}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Grade Input */}
      <TextInput
        style={styles.input}
        placeholder="Custom Desired Grade"
        placeholderTextColor="gray"
        keyboardType="numeric"
        value={desiredGrade}
        onChangeText={setDesiredGrade}
      />

      {/* Final Grade Result */}
      {finalGrade !== undefined && (
        <Text style={styles.resultText}>
          You need a final grade of: {finalGrade}
        </Text>
      )}
</View>
      <View>
        <Text style= {styles.headerText}> More Tools Coming Soon!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    color: "white",
    fontSize: 18,
    borderRadius: 10,
  },
  comingSoonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  gradeButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#494547",
    padding: 8,
    borderRadius: 25,
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: "white",
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  resultText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#121212",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    borderColor: "white",
    marginTop: 60,
    borderWidth: 1,
  
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CalculatorPage;
