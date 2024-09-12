import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";

class Grade {
  constructor(
    public assignmentType: string,
    public assignmentName: string,
    public grade: number,
    public date: Date
  ) {}
}

// Class to represent a course
class Course {
  constructor(
    public name: string,
    public overallGrade: number,
    public grades: Grade[]
  ) {}

  addAssignment(assignment: Grade) {
    this.grades[this.grades.length] = assignment;
  }
}

const CalculatorPage = ({
  gradesData,
  hacBroken,
  courses,
}: {
  gradesData: any;
  hacBroken: boolean;
  courses: Course[] | null;
}) => {
  // return (
  //   <Link
  //     href={{
  //       pathname: "/(screens)/gradesCalculating",
  //       params: { name: "Dan" },
  //     }}
  //     asChild
  //   >
  //     <Text style={styles.comingSoonText}>Calculator Soon</Text>
  //   </Link>
  // );
  return (
    <Text style={styles.comingSoonText}>Calculator Coming Very Soon!</Text>
  );
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
