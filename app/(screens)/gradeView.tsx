import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Button,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useLocalSearchParams, router, Link } from "expo-router";
  import Numbers from "@/constants/Numbers";
  import { Entypo, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
  import Colors from "@/constants/Colors";
  import {
    calculateAssignmentTypePercentages,
    CalculateOverallAverage,
    Course,
    getCourses,
    Grade,
  } from "@/globalVars/gradesVariables";
  import Modal from "react-native-modal";
  import AutoCompleteTextInput from "@/components/AutoCompleteTextInput";
import HACNeededScreen from "@/components/HACNeededScreen";

const GradeView = () => {
    const { className } = useLocalSearchParams();

const [originalCourse, setOriginalCourse] = useState<Course>();

const [courses, setCourses] = useState<Course[] | null | undefined>(null);
const [selectedCourse, setSelectedCourse] = useState<
Course | null | undefined
>(null);
const [refreshing, setRefreshing] = useState<boolean>(false);

const [addAssignmentModalVisible, setVisibleAddAssignment] =
useState<boolean>(false);
const [editAssignmentModalVisible, setEditingAssignment] =
useState<boolean>(false);
const [assignmentOptionsModalVisible, setLookingAtAssignmentOptions] =
useState<boolean>(false);

const [selectedGrade, setSelectedGrade] = useState<Grade>();

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
                setOriginalCourse(courses[i]);
                setSelectedCourse(courses[i].copy());
            }
        }
    }
}, [courses]);
// Function to determine the background color based on the grade
const getBackgroundColor = (grade: number) => {
    if (grade >= 90) return Colors.courseGradeAColor; // Green for A
    if (grade >= 80) return Colors.courseGradeBColor; // Blue for B
    if (grade >= 70) return Colors.courseGradeCColor; // Yellow for C
    return Colors.courseGradeFailColor; // Red for failing grades
};

const renderCourseItem = ({ item }: { item: Course }) => {
    const backgroundColor =
    item.overallGrade === -100
        ? "black"
        : getBackgroundColor(item.overallGrade);
    }
    

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
    }   

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
    </View>
    );
};
const renderHeader = (overallGrade: number, courseTitle: string) => {
    // Function to get the background color based on the overall grade
    const getGradeBorderColor = (grade: number) => {
    if (grade >= 90) return Colors.gradeGradeAColor; // Green for A
    if (grade >= 80) return Colors.gradeGradeBColor; // Blue for B
    if (grade >= 70) return Colors.gradeGradeCColor; // Yellow for C
    return Colors.gradeGradeFailColor; // Red for failing grades
    };
    const getGradeBackgroundColor = (grade: number) => {
    if (grade >= 90) return Colors.gradeGradeAColorBG; // Green for A
    if (grade >= 80) return Colors.gradeGradeBColorBG; // Blue for B
    if (grade >= 70) return Colors.gradeGradeCColorBG; // Yellow for C
    return Colors.gradeGradeFailColorBG; // Red for failing grades
    };

    // Grade background color
    const borderColor = getGradeBorderColor(overallGrade);
    const backgroundColor = getGradeBackgroundColor(overallGrade);

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
            <Text style={styles.headerTitleText}>{courseTitle}</Text>
        </View>

        <View
            style={{
            alignSelf: "center",
            backgroundColor: borderColor,
            padding: 10,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: "#000000",
            }}
        >
            <Link
            href={{
                pathname: "(screens)/gradesCalculating",
                params: {
                className: selectedCourse ? selectedCourse.name : "Dan",
                },
            }}
            asChild
            >
            <Text
                style={{ fontSize: 14, fontWeight: "bold", color: "#000000" }}
            >
                Calculator
            </Text>
            </Link>
        </View>
        </View>

        <View style={{ flexDirection: "row", gap: 25 }}>
        {/* Overall Grade Box */}
        <View
            style={[styles.headerGradeBox, { borderColor, backgroundColor }]}
        >
            <Text style={styles.headerGradeText}>{`${overallGrade}%`}</Text>
        </View>

        <View style={{ alignContent: "center", justifyContent: "center" }}>
            <Text style={[styles.averagesTopText, { color: Colors.cfuColor }]}>
            CFU Average:{"  "}
            {percentagesArray
                ? percentagesArray[0] == -100
                ? "N/A"
                : "" + percentagesArray[0].toFixed(2)
                : "N/A"}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.raColor }]}>
            RA Average:{"     "}
            {percentagesArray
                ? percentagesArray[1] == -100
                ? "N/A"
                : "" + percentagesArray[1].toFixed(2)
                : "N/A"}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.saColor }]}>
            SA Average:{"     "}
            {percentagesArray
                ? percentagesArray[2] == -100
                ? "N/A"
                : "" + percentagesArray[2].toFixed(2)
                : "N/A"}
            </Text>
        </View>
        </View>
    </View>
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
      padding: 10,
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
      height: 85,
      borderColor: "#363737",
      borderWidth: 2,
      borderRadius: 10,
      margin: 10,
      marginBottom: 0,
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
      paddingTop: 5, // Add padding to make the header box taller
      paddingBottom: 15,
      borderBottomWidth: 1, // Border for separating the header from the items
      borderBottomColor: "#444", // Border color
    },
    headerTitleBox: {
      // position: "absolute", // Positioning it freely within the parent container
      // left: 0, // Ensure it takes full width
      // right: 0,
      marginLeft: 10,
      alignItems: "center", // Center text horizontally within this container
      justifyContent: "center",
    },
    headerCalcButtonBox: {
      position: "absolute", // Positioning it freely within the parent container
      left: 0, // Ensure it takes full width
      right: 0,
      alignItems: "flex-end", // Center text horizontally within this container
    },
    headerTitleText: {
      fontSize: 24, // Larger font for the course title
      fontWeight: "bold",
      color: "white",
      textAlign: "center",
    },
    headerGradeBox: {
      borderRadius: 10, // Rounded corners for the grade box
      justifyContent: "center", // Center the grade text
      alignItems: "center", // Center the grade text horizontally
      height: 100,
      width: 130,
      borderWidth: 5,
      marginLeft: 5,
    },
    headerGradeText: {
      fontSize: 30, // Larger font for the overall grade
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
      height: 55, // Adjusts the height of the box to fit the content
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
      gap: 10,
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

  export default GradeView;
