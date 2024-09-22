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
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
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
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

const gradesCalculating = () => {
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
  const WhatDoINeedBox = () => (
    <View style={{
      padding: 7, 
      borderRadius: 10, 
      backgroundColor: "green", 
      width: "99%", 
      alignContent: "center", 
      alignItems: "center", 
      height: 40,
      marginTop: 10 }}>
      <Text style={{ fontWeight: "bold", fontSize: 20, textAlign: "center", color: "white" }}>What Do I Need?</Text>
    </View>
  );
  
  
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
      <TouchableOpacity
        onPress={() => {
          setSelectedGrade(item);
          setAddAssignmentName(item.assignmentName);
          setAddAssignmentGrade(
            "" + (item.grade == -100 ? "N/A" : item.grade)
          );
          setAddAssignmentType(item.assignmentType);
          setLookingAtAssignmentOptions(true);
        } }
        style={{}}
      >
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
        </TouchableOpacity>
    );
  };
  const renderHeader = () => {
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


    let percentagesArray = calculateAssignmentTypePercentages(selectedCourse);
    let overallCourseAverage = Math.round(
      CalculateOverallAverage(selectedCourse, percentagesArray)
    );

    // Grade background color
    const borderColor = getGradeBorderColor(overallCourseAverage);
    const backgroundColor = getGradeBackgroundColor(overallCourseAverage);

    return (
      <View style={styles.headerContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1, // Border for separating the header from the items
            borderBottomColor: "#444", // Border color
            paddingEnd:15,
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
          <TouchableOpacity
            style={{
              borderRadius: 10,
              padding: 5,
              backgroundColor: Colors.addAssignmentBG,
            }}
            onPress={() => {
              setAddingError(null);
              setAddAssignmentName("");
              setAddAssignmentType("");
              setAddAssignmentGrade("");
              setVisibleAddAssignment(true);
            }}
          >
            <Ionicons
              name="add-sharp"
              size={20}
              color="#ffffff"
              style={{ padding: 3}}
            />
          </TouchableOpacity>

        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 15}}>
          {/* Overall Grade Box */}
          <View
            style={[styles.headerGradeBox, { backgroundColor, borderColor }]}
          >
            <Text
              style={styles.headerGradeText}
            >{`${overallCourseAverage}%`}</Text>
          </View>
          <View style={{ alignContent: "center", marginRight: 20}}>
            <Text style={[styles.averagesTopText, { color: Colors.cfuColor }]}>
              CFU Average:{"  "}
              {!refreshing
                ? percentagesArray
                  ? percentagesArray[0] == -100
                    ? "N/A"
                    : "" + percentagesArray[0].toFixed(2)
                  : "N/A"
                : "Loading..."}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.raColor }]}>
              RA Average:{"     "}
              {!refreshing
                ? percentagesArray
                  ? percentagesArray[1] == -100
                    ? "N/A"
                    : "" + percentagesArray[1].toFixed(2)
                  : "N/A"
                : "Loading..."}
            </Text>
            <Text style={[styles.averagesTopText, { color: Colors.saColor }]}>
              SA Average:{"     "}
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
              {/*{WhatDoINeedBox()}*/}
        </View>

    );
  };

  const [addAssignmentType, setAddAssignmentType] = useState<string>("");
  const [addAssignmentName, setAddAssignmentName] = useState<string>("");
  const [addAssignmentGrade, setAddAssignmentGrade] = useState<string>("");

  const [addingError, setAddingError] = useState<string | null>(null);

  function AddNewAssignment(): boolean {
    if (addAssignmentName === "") {
      setAddingError("Please input an assignment name");
      return false;
    }
    try {
      Number.parseFloat(addAssignmentGrade);
    } catch {
      setAddingError("Please input a grade");
      return false;
    }
    if (addAssignmentGrade === "") {
      setAddingError("Please input a grade");
      return false;
    }
    if (
      addAssignmentType !== "Summative Assessments" &&
      addAssignmentType !== "Relevant Applications" &&
      addAssignmentType !== "Checking for Understanding"
    ) {
      setAddingError("Please input a correct assignment type");
      return false;
    }

    selectedCourse?.addAssignment(
      new Grade(
        addAssignmentType,
        addAssignmentName,
        Number.parseFloat(addAssignmentGrade),
        100,
        new Date()
      )
    );
    return true;
  }
  function SaveAssignmentEdits() {
    let changeName = true;
    let changeType = true;
    let changeGrade = true;

    if (addAssignmentName === "") {
      changeName = false;
    }

    try {
      Number.parseFloat(addAssignmentGrade);
    } catch {
      changeGrade = false;
    }
    if (addAssignmentGrade === "" || addAssignmentGrade === "N/A") {
      changeGrade = false;
    }
    if (
      addAssignmentType !== "Summative Assessments" &&
      addAssignmentType !== "Relevant Applications" &&
      addAssignmentType !== "Checking for Understanding"
    ) {
      changeType = false;
    }

    if (selectedGrade) {
      if (changeName) {
        selectedGrade.assignmentName = addAssignmentName;
      }
      if (changeType) {
        selectedGrade.assignmentType = addAssignmentType;
      }
      if (changeGrade) {
        selectedGrade.grade = Number.parseFloat(addAssignmentGrade);
      }
    }
  }

  function ResetCalculator() {
    setSelectedCourse(originalCourse?.copy());
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.overallBackground,
        height: "100%",
      }}
    >
<View style={{ flex: 1, padding: 3 }}>
  {selectedCourse && (
    <View style={{ flex: 1 }}>
      {renderHeader()}
        <FlatList
          data={selectedCourse.grades}
          renderItem={renderGradeItem}
          keyExtractor={(item: { assignmentName: any }) => item.assignmentName}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true} // If it's nested inside another ScrollView
        />
        </View>
    
  )}
</View>
      <Modal
        isVisible={addAssignmentModalVisible}
        animationIn={"pulse"}
        animationOut={"fadeOutDown"}
        onBackdropPress={() => setVisibleAddAssignment(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              height: "60%",
              marginHorizontal: 20,
              backgroundColor: "#121212",
              borderWidth: 3,
              borderColor: "#444",
              borderRadius: 10,
            }}
          >
            <TextInput
              style={styles.infoInput}
              placeholder="Assignment Name..."
              placeholderTextColor={"grey"}
              value={addAssignmentName}
              onChangeText={setAddAssignmentName}
              //ref={hacPasswordInputRef}
            />

            <AutoCompleteTextInput
              style={styles.textInput}
              onChangeText={setAddAssignmentType}
              value={addAssignmentType}
              keyboardType="default"
              placeholder="Assignment Type..."
              placeholderTextColor="grey"
              possibleInputs={
                new Array(
                  "Summative Assessments",
                  "Relevant Applications",
                  "Checking for Understanding"
                )
              }
            />

            <TextInput
              style={styles.gradeInfoInput}
              placeholder="Grade..."
              placeholderTextColor={"grey"}
              keyboardType="decimal-pad"
              value={addAssignmentGrade}
              onChangeText={setAddAssignmentGrade}
              //ref={hacPasswordInputRef}
            />

            {addingError && addingError !== "" && (
              <Text style={styles.error}>{addingError}</Text>
            )}


            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  marginTop: 15,
                  marginHorizontal: 15,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    borderWidth: 3,
                    borderColor: "#ffffff",
                    borderRadius: 10,
                    padding: 5,
                    backgroundColor: Colors.resetCalcBG,
                  }}
                  onPress={() => setVisibleAddAssignment(false)}
                >
                  <Ionicons
                    name="ban-sharp"
                    size={20}
                    color="#ffffff"
                    style={{ paddingRight: 3 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    borderWidth: 3,
                    borderColor: "#ffffff",
                    borderRadius: 10,
                    padding: 5,
                    backgroundColor: Colors.addAssignmentBG,
                  }}
                  onPress={() => {
                    if (AddNewAssignment()) {
                      setVisibleAddAssignment(false);
                    }
                  }}
                >
                  <Ionicons
                    name="add-sharp"
                    size={20}
                    color="#ffffff"
                    style={{ paddingRight: 3 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Add Assignment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        isVisible={assignmentOptionsModalVisible}
        animationIn={"pulse"}
        animationOut={"fadeOutDown"}
        onBackdropPress={() => setLookingAtAssignmentOptions(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              height: "65%",
              marginHorizontal: 20,
              backgroundColor: "#121212",
              borderRadius: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setLookingAtAssignmentOptions(false)}
              style={styles.close_button}
            >
              <Ionicons name="close-sharp" size={24} color="white" />
            </TouchableOpacity>

            <TextInput
              style={styles.infoInput}
              placeholder="Assignment Name..."
              placeholderTextColor={"grey"}
              value={addAssignmentName}
              onChangeText={setAddAssignmentName}
              //ref={hacPasswordInputRef}
            />

            <AutoCompleteTextInput
              style={styles.textInput}
              onChangeText={setAddAssignmentType}
              value={addAssignmentType}
              keyboardType="default"
              placeholder="Assignment Type..."
              placeholderTextColor="grey"
              possibleInputs={
                new Array(
                  "Summative Assessments",
                  "Relevant Applications",
                  "Checking for Understanding"
                )
              }
            />

            <TextInput
              style={styles.gradeInfoInput}
              placeholder="Grade..."
              placeholderTextColor={"grey"}
              keyboardType="decimal-pad"
              value={addAssignmentGrade}
              onChangeText={setAddAssignmentGrade}
              //ref={hacPasswordInputRef}
            />

            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  marginTop: 15,
                  marginHorizontal: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    borderRadius: 10,
                    padding: 5,
                    width: 150,
                    height: 40,
                    alignItems: "center",
                    alignSelf: "center",
                    backgroundColor: Colors.saveAssignmentBG,
                  }}
                  onPress={() => {
                    SaveAssignmentEdits();
                    setLookingAtAssignmentOptions(false);
                  }}
                >
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#ffffff"
                    style={{ paddingRight: 5 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "bold",
                      alignItems: "center",
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    borderRadius: 10,
                    padding: 5,
                    alignItems: "center",
                    width: 150,
                    backgroundColor: Colors.deleteAssignmentBG,
                  }}
                  onPress={() => {
                    selectedCourse?.deleteAssignment(selectedGrade);
                    setLookingAtAssignmentOptions(false);
                  }}
                >
                  <Entypo
                    name="minus"
                    size={20}
                    color="#ffffff"
                    style={{ paddingRight: 5 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  error: {
    color: Colors.addAssignmentErrorText,
    textAlign: "center",
    marginTop: 10,
    fontSize: 17,
  },
  textInput: {
    width: "70%",
    marginVertical: 7,
    backgroundColor: "#41b42d",
    borderRadius: 10,
    padding: 10,
    color: "#ffffff",
    alignSelf: "center",
    textAlign: "center",
  },
  gradeInfoInput: {
    color: "white",
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginVertical: 50,
    paddingBottom: 3,
    alignSelf: "center",
    width: 90,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  infoInput: {
    color: "white",
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginBottom: 50,
    marginTop: 20,
    textAlign: "center",
    paddingBottom: 3,
    alignSelf: "center",
    width: 300,
    fontWeight: "bold",
    flex: 1,
  },
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
  close_button: {
    paddingTop: 15,
    paddingLeft: 15,
  },
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
    paddingBottom: 10,
    borderBottomWidth: 1, // Border for separating the header from the items
    borderBottomColor: "#444", // Border color
  },
  headerTitleBox: {
    flexDirection: "row", // Row format for the title and grade box
    alignItems: "flex-start",
    alignContent: "space-between" // Center text horizontally within this container
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

  },
  headerGradeText: {
    fontSize: 30, // Larger font for the overall grade
    fontWeight: "bold",
    color: "white",
  },
  extratext: {
    fontSize: 20, // Larger font for the overall grade
    fontWeight: "bold",
    color: "white",
    textAlign: "center",

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
    paddingStart: 15,
    paddingEnd: 15,
    borderBottomWidth: 1, // Border for separating the items
    borderBottomColor: "#444", // Border color

  },
  assignmentInfo: {
    flex: 1, // Takes up most of the row width
    justifyContent: "flex-start", // Aligns content to the start
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  assignmentType: {
    fontSize: 14,
    //color: "#aaa", // Slightly lighter color for assignment type
  },
  date: {
    fontSize: 12,
    color: "#888", // Lighter color for date
  },
  gradeBox: {
    borderRadius: 12, // Rounded corners for grade box
    borderWidth: 1,
    borderColor: Colors.gradeBoxBorder,
    justifyContent: "center", // Center the grade text
    alignItems: "center", // Center the grade text horizontally
    width: 70,
    minWidth: 60, // Ensure a minimum width for the grade box
    height: 55, // Adjust the height of the box to fit the content
  },
  gradeText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "white",
  },
  back_button: {
    zIndex: 2,
  },
});
export default gradesCalculating;