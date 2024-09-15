import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Numbers from "@/constants/Numbers";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {
  calculateAssignmentTypePercentages,
  Course,
  getCourses,
  Grade,
} from "@/globalVars/gradesVariables";

const gradesCalculating = () => {
  const { className } = useLocalSearchParams();

  const [courses, setCourses] = useState<Course[] | null | undefined>(null);
  const [selectedCourse, setSelectedCourse] = useState<
    Course | null | undefined
  >(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  async function setCoursesAsync() {
    if (!courses) {
      setCourses(await getCourses());
    }
  }

  let intervalId: NodeJS.Timeout = setInterval(() => {
    setCoursesAsync();
  }, 10);

  useEffect(() => {
    if (courses) {
      clearInterval(intervalId);

      for (let i = 0; i < courses.length; i++) {
        if (courses[i].name == className) {
          setSelectedCourse(courses[i].copy());
        }
      }
    }
  }, [courses]);

  const renderGradeItem = ({ item }: { item: Grade }) => {
    // Function to get the background color based on the grade
    const getGradeBackgroundColor = (grade: number) => {
      if (grade >= 90) return Colors.gradeGradeAColor; // Green for A
      if (grade >= 80) return Colors.gradeGradeBColor; // Blue for B
      if (grade >= 70) return Colors.gradeGradeCColor; // Yellow for C
      return Colors.gradeGradeFailColor; // Red for failing grades
    };

    // Grade background color
    const backgroundColor =
      item.grade === -100 ? "#444" : getGradeBackgroundColor(item.grade);

    const color =
      item.assignmentType.toLowerCase() == "summative assessments"
        ? Colors.saColor
        : item.assignmentType.toLowerCase() == "relevant applications"
        ? Colors.raColor
        : item.assignmentType.toLowerCase() == "checking for understanding"
        ? Colors.cfuColor
        : "#aaa";

    return (
      <View style={styles.gradeRow}>
        {/* Left side: assignment name, type, and date */}
        <View style={styles.assignmentInfo}>
          <Text numberOfLines={1} style={styles.assignmentName}>
            {item.assignmentName}
          </Text>
          <Text style={[styles.assignmentType, { color }]}>
            {item.assignmentType}
          </Text>
          <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>
        </View>

        {/* Right side: grade box */}
        <View style={[styles.gradeBox, { backgroundColor }]}>
          <Text style={styles.gradeText}>
            {item.grade === -100 ? "N/A" : `${item.grade}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => {}} style={{}}>
          <SimpleLineIcons name="options-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };
  const renderHeader = () => {
    // Function to get the background color based on the overall grade
    const getGradeBackgroundColor = (grade: number) => {
      if (grade >= 90) return Colors.gradeGradeAColor; // Green for A
      if (grade >= 80) return Colors.gradeGradeBColor; // Blue for B
      if (grade >= 70) return Colors.gradeGradeCColor; // Yellow for C
      return Colors.gradeGradeFailColor; // Red for failing grades
    };

    // Grade background color
    const backgroundColor = getGradeBackgroundColor(
      selectedCourse ? selectedCourse.overallGrade : 0
    );

    let percentagesArray = calculateAssignmentTypePercentages(selectedCourse);

    return (
      <View style={styles.headerContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            borderBottomWidth: 1, // Border for separating the header from the items
            borderBottomColor: "#444", // Border color
            marginBottom: 15,
            paddingBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={styles.back_button}
          >
            <Ionicons
              name="arrow-back-sharp"
              size={Numbers.backButtonSize}
              color={Colors.backButton}
            />
          </TouchableOpacity>
          {/* Course Title */}
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitleText}>{selectedCourse?.name}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 25 }}>
          {/* Overall Grade Box */}
          <View style={[styles.headerGradeBox, { backgroundColor }]}>
            <Text style={styles.headerGradeText}>{`${
              selectedCourse ? selectedCourse.overallGrade : "N/A"
            }%`}</Text>
          </View>

          <View style={{ alignContent: "center", justifyContent: "center" }}>
            <Text style={[styles.averagesTopText, { color: Colors.cfuColor }]}>
              CFU Average:{" "}
              {!refreshing
                ? percentagesArray
                  ? percentagesArray[0] == -100
                    ? "N/A"
                    : "" + percentagesArray[0].toFixed(2)
                  : "N/A"
                : "Loading..."}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.raColor }]}>
              RA Average:{" "}
              {!refreshing
                ? percentagesArray
                  ? percentagesArray[1] == -100
                    ? "N/A"
                    : "" + percentagesArray[1].toFixed(2)
                  : "N/A"
                : "Loading..."}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.saColor }]}>
              SA Average:{" "}
              {!refreshing
                ? percentagesArray
                  ? percentagesArray[2] == -100
                    ? "N/A"
                    : "" + percentagesArray[2].toFixed(2)
                  : "N/A"
                : "Loading..."}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.overallBackground,
        height: "100%",
      }}
    >
      <View style={{ padding: 15 }}>
        {selectedCourse && (
          <View style={{ marginBottom: 450 }}>
            {renderHeader()}
            <FlatList
              data={selectedCourse.grades}
              renderItem={renderGradeItem}
              keyExtractor={(item: { assignmentName: any }) =>
                item.assignmentName
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  averagesTopText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 7,
    color: "#ffffff",
  },
  topText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    borderWidth: 4,
    borderRadius: 12,
    borderColor: "#ffffff",
    padding: 10,
    backgroundColor: Colors.transcriptBubblesBG,
  },
  close_button: { padding: 10 },
  comingSoonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 60,
  },
  container: {
    padding: 15,
    height: "93%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    height: 86,
    borderColor: "#363737",
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  causeWhyNot: {
    borderRadius: 10,
  },
  headerContainer: {
    marginBottom: 20, // Add spacing below the header
    paddingTop: 20, // Add padding to make the header box taller
    paddingBottom: 30,
    borderBottomWidth: 5, // Border for separating the header from the items
    borderBottomColor: "#444", // Border color
  },
  headerTitleBox: {
    position: "absolute", // Positioning it freely within the parent container
    left: 0, // Ensure it takes full width
    right: 0,
    alignItems: "center", // Center text horizontally within this container
  },
  headerTitleText: {
    fontSize: 24, // Larger font for the course title
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerGradeBox: {
    borderRadius: 12, // Rounded corners for the grade box
    justifyContent: "center", // Center the grade text
    alignItems: "center", // Center the grade text horizontally
    height: 100,
    width: 120,
  },
  headerGradeText: {
    fontSize: 22, // Larger font for the overall grade
    fontWeight: "bold",
    color: "white",
  },

  gradeItem: {
    backgroundColor: Colors.transcriptBubblesBG,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  grade: {
    fontSize: 24,
    color: "white",
    textAlign: "right",
  },
  gradeContainer: {
    borderRadius: 10, // Curved borders for the colored box
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
    width: 90, // Adjusts the width of the box to fit the content
    height: 45, // Adjusts the height of the box to fit the content
  },
  courseGrade: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  gradeRow: {
    flexDirection: "row", // Row format for left and right sides
    justifyContent: "space-between", // Space between left and right
    alignItems: "center", // Vertically center the content
    paddingVertical: 10, // Padding for spacing
    paddingHorizontal: 5, // Horizontal padding
    borderBottomWidth: 1,
    borderBottomColor: "#444", // Border color
    gap: 20,
  },
  assignmentInfo: {
    flex: 1, // Takes up most of the row width
    justifyContent: "flex-start", // Aligns content to the start
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 3,
    flex: 1,
  },
  assignmentType: {
    fontSize: 14,
    //color: "#aaa", // Slightly lighter color for assignment type
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: "#888", // Lighter color for date
  },
  gradeBox: {
    borderRadius: 12, // Rounded corners for grade box
    borderWidth: 2,
    borderColor: Colors.gradeBoxBorder,
    justifyContent: "center", // Center the grade text
    alignItems: "center", // Center the grade text horizontally
    paddingVertical: 15, // Padding inside the box
    width: 80,
    minWidth: 60, // Ensure a minimum width for the grade box
  },
  gradeText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "white",
  },
  back_button: {
    zIndex: 2, // Ensure the back button stays on top
  },
});

export default gradesCalculating;
