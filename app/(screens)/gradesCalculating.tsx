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
  ImageBackground,
  Image,
  KeyboardAvoidingView,
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
  neededScore,
} from "@/globalVars/gradesVariables";
import Modal from "react-native-modal";
import AutoCompleteTextInput from "@/components/AutoCompleteTextInput";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import Svg, { G, Circle, Line } from "react-native-svg";
import { Alert } from "react-native";

const gradesCalculating = () => {
  const [selectedTab, setSelectedTab] = useState<string>("addAssignment");

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

  const [selectedType, setSelectedType] = useState<{
    id: number;
    label: string;
    logo: any;
  } | null>(null); // Track selected type

  const assignmentTypes = [
    { id: 1, label: "CFU" },
    { id: 2, label: "RA" },
    { id: 3, label: "SA" },
  ];

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
    <View
      style={{
        padding: 7,
        borderRadius: 10,
        backgroundColor: "green",
        width: "99%",
        alignContent: "center",
        alignItems: "center",
        height: 40,
        marginTop: 10,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          textAlign: "center",
          color: "white",
        }}
      >
        What Do I Need?
      </Text>
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
      item.grade === -100
        ? "#444"
        : getGradeBackgroundColor((item.grade / item.maxGrade) * 100);

    // Function to convert assignment type to abbreviation
    const getAssignmentTypeAbbreviation = (type: string) => {
      switch (type.toLowerCase()) {
        case "summative assessments":
          return "SA";
        case "relevant applications":
          return "RA";
        case "checking for understanding":
          return "CFU";
        default:
          return type;
      }
    };

    const typeColor =
      item.assignmentType.toLowerCase() === "summative assessments"
        ? Colors.saColor
        : item.assignmentType.toLowerCase() === "relevant applications"
        ? Colors.raColor
        : item.assignmentType.toLowerCase() === "checking for understanding"
        ? Colors.cfuColor
        : "#aaa";

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedGrade(item);
          setAddAssignmentName(item.assignmentName);
          setAddAssignmentGrade(
            "" + (item.grade === -100 ? "N/A" : item.grade)
          );
          setAddAssignmentType(item.assignmentType);
          setLookingAtAssignmentOptions(true);
        }}
        style={{}}
      >
        <View style={styles.gradeRow}>
          {/* Middle: assignment name, tag for type, and date */}
          <View style={styles.assignmentInfo}>
            <Text numberOfLines={1} style={styles.assignmentName}>
              {item.assignmentName}
            </Text>

            {/* Date and assignment type tag on the same line */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>

              {/* Tag for assignment type */}
              <View
                style={{
                  backgroundColor: typeColor,
                  borderRadius: 15,
                  paddingHorizontal: 10,
                  marginTop: -2,
                  paddingVertical: 3,
                  marginRight: 10, // Space between date and tag
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  {getAssignmentTypeAbbreviation(item.assignmentType)}
                </Text>
              </View>
            </View>
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
    let percentagesArray = calculateAssignmentTypePercentages(selectedCourse);
    let overallCourseAverage = Math.round(
      CalculateOverallAverage(selectedCourse, percentagesArray)
    );

    const getGradeColor = (grade: number) => {
      if (grade >= 90)
        return {
          border: Colors.gradeGradeAColor,
          background: Colors.gradeGradeAColorBG,
        };
      if (grade >= 80)
        return {
          border: Colors.gradeGradeBColor,
          background: Colors.gradeGradeBColorBG,
        };
      if (grade >= 70)
        return {
          border: Colors.gradeGradeCColor,
          background: Colors.gradeGradeCColorBG,
        };
      return {
        border: Colors.gradeGradeFailColor,
        background: Colors.gradeGradeFailColorBG,
      };
    };

    const circleColor = getGradeColor(overallCourseAverage);
    const radius = 60;
    const strokeWidth = 10;
    const circleCircumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circleCircumference * (1 - overallCourseAverage / 100);

    return (
      <View style={styles.headerContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            marginBottom: 20,
            paddingBottom: 20,
          }}
        >
          {/* Course Title */}
          <View style={styles.headerTitleBox}>
            <Text numberOfLines={1} style={styles.headerTitleText}>
              {selectedCourse?.name}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Overall Grade Box */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Svg height="140" width="140">
              <Circle
                cx="70"
                cy="70"
                r={radius}
                stroke={circleColor.border}
                strokeWidth={strokeWidth}
                fill="none"
                strokeOpacity={0.3} // Lighter background circle
              />
              <Circle
                cx="70"
                cy="70"
                r={radius}
                stroke={circleColor.border}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circleCircumference}, ${circleCircumference}`}
                strokeDashoffset={
                  overallCourseAverage >= 0
                    ? strokeDashoffset
                    : circleCircumference
                }
                strokeLinecap="round"
              />
            </Svg>
            <Text
              style={[
                styles.headerGradeText,
                { color: "white", position: "absolute", fontSize: 24, top: 50 },
              ]}
            >
              {overallCourseAverage >= 0 ? `${overallCourseAverage}%` : "N/A"}
            </Text>
          </View>

          {/* Averages Container */}
          <View
            style={{ flexDirection: "column", marginTop: 25, marginLeft: 20 }}
          >
            <View
              style={{
                borderRadius: 10,
                padding: 10,
                borderColor: "#1b1b1b",
                borderWidth: 2,
                backgroundColor: "#1b1b1b",
                width: 210,
              }}
            >
              {/* SA Average Card */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <View
                  style={{
                    height: 35,
                    width: 25,
                    backgroundColor: Colors.saColor,
                    borderColor: "white",
                    borderWidth: 2,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  SA Average: {"   "}
                  {!refreshing
                    ? percentagesArray && percentagesArray[2] !== -100
                      ? percentagesArray[2].toFixed(2)
                      : "N/A"
                    : "Loading..."}
                </Text>
              </View>

              {/* RA Average Card */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <View
                  style={{
                    height: 35,
                    width: 25,
                    backgroundColor: Colors.raColor,
                    borderColor: "white",
                    borderWidth: 2,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  RA Average: {"   "}
                  {!refreshing
                    ? percentagesArray && percentagesArray[1] !== -100
                      ? percentagesArray[1].toFixed(2)
                      : "N/A"
                    : "Loading..."}
                </Text>
              </View>

              {/* CFU Average Card */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <View
                  style={{
                    height: 35,
                    width: 25,
                    backgroundColor: Colors.cfuColor,
                    borderColor: "white",
                    borderWidth: 2,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  CFU Average:{" "}
                  {!refreshing
                    ? percentagesArray && percentagesArray[0] !== -100
                      ? percentagesArray[0].toFixed(2)
                      : "N/A"
                    : "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              borderRadius: 10,
              //borderWidth: 2,
              borderColor: "white",
              padding: 5,
              height: 40,
              width: "45%",
              paddingVertical: 8,
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "#1b1b1b",
            }}
            onPress={() => ResetCalculator()}
          >
            <Ionicons
              name="refresh-sharp"
              size={20}
              color="#ffffff"
              style={{ paddingRight: 3 }}
            />
            <Text
              style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold" }}
            >
              Reset Calculator
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              borderRadius: 10,
              //borderWidth: 2,
              borderColor: "white",
              padding: 5,
              height: 40,
              width: "53%",
              paddingVertical: 8,
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "#0D92F4",
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
              name="calculator"
              size={20}
              color="#ffffff"
              style={{ paddingRight: 3 }}
            />
            <Text
              style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold" }}
            >
              Calculator
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoBox}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color="#f4c60d"
            style={{ paddingRight: 3 }}
          />
          <Text style={styles.infoText}>Tap on an assignment to edit</Text>
        </View>
      </View>
    );
  };

  const [addAssignmentType, setAddAssignmentType] = useState<string>("");
  const [desiredGrade, setDesiredGrade] = useState<string>("");
  const [desiredCategory, setDesiredCategory] = useState<string>("");
  const [addAssignmentName, setAddAssignmentName] = useState<string>("");
  const [addAssignmentGrade, setAddAssignmentGrade] = useState<string>("");
  const [customGrade, setCustomGrade] = useState<string>(""); // Add this line

  const getColorByType = (label: string, isSelected = true) => {
    const colors = {
      saColor: "#f4c60d",
      cfuColor: "#4688f2",
      raColor: "#810df4",
    };

    // You can match label with the keys to return the appropriate color
    if (label === "SA") return isSelected ? colors.saColor : "#494547"; // Adjust to your actual assignment type
    if (label === "CFU") return isSelected ? colors.cfuColor : "#494547"; // Adjust to your actual assignment type
    if (label === "RA") return isSelected ? colors.raColor : "#494547"; // Adjust to your actual assignment type
    return "#494547"; // Default color if none match
  };

  const [addingError, setAddingError] = useState<string | null>(null);

  function AddNewAssignment(): boolean {
    try {
      Number.parseFloat(addAssignmentGrade);
    } catch {
      setAddingError("Please input a grade");
      return false;
    }

    let tempAssignmentType;

    if (addAssignmentType === "CFU") {
      tempAssignmentType = "Checking for Understanding";
    }
    if (addAssignmentType === "RA") {
      tempAssignmentType = "Relevant Applications";
    }
    if (addAssignmentType === "SA") {
      tempAssignmentType = "Summative Assessments";
    }

    if (addAssignmentGrade === "") {
      setAddingError("Please input a grade");
      return false;
    }

    if (
      tempAssignmentType !== "Checking for Understanding" &&
      tempAssignmentType !== "Relevant Applications" &&
      tempAssignmentType !== "Summative Assessments"
    ) {
      setAddingError("Please input a correct assignment type");
      return false;
    }

    const checkAndSetWeight = (
      type: string,
      weight: number | undefined,
      setWeight: (value: number) => void
    ) => {
      if (weight === 0) {
        Alert.prompt(
          "Missing Weight",
          `Please enter a weight for ${type} out of 100:`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () =>
                setAddingError("Assignment type weight is required"),
            },
            {
              text: "OK",
              onPress: (input) => {
                const parsedWeight = Number.parseFloat(input);
                if (isNaN(parsedWeight) || parsedWeight <= 0) {
                  setAddingError("Please input a valid weight.");
                } else {
                  setWeight(parsedWeight);
                }
              },
            },
          ],
          "plain-text"
        );
        return false;
      }
      return true;
    };

    // Check each type and prompt for a weight if missing
    if (
      tempAssignmentType === "Checking for Understanding" &&
      !checkAndSetWeight(
        "Checking for Understanding",
        selectedCourse?.cfuPercent,
        (weight) => {
          selectedCourse!.cfuPercent = weight;
        }
      )
    ) {
      return false;
    } else if (
      tempAssignmentType === "Relevant Applications" &&
      !checkAndSetWeight(
        "Relevant Applications",
        selectedCourse?.raPercent,
        (weight) => {
          selectedCourse!.raPercent = weight;
        }
      )
    ) {
      return false;
    } else if (
      tempAssignmentType === "Summative Assessments" &&
      !checkAndSetWeight(
        "Summative Assessments",
        selectedCourse?.saPercent,
        (weight) => {
          selectedCourse!.saPercent = weight;
        }
      )
    ) {
      return false;
    }

    selectedCourse?.addAssignment(
      new Grade(
        tempAssignmentType,
        addAssignmentName === "" ? "New Assignment" : addAssignmentName,
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

    let tempAssignmentType = "";

    if (addAssignmentType === "CFU") {
      tempAssignmentType = "Checking for Understanding";
    }
    if (addAssignmentType === "RA") {
      tempAssignmentType = "Relevant Applications";
    }
    if (addAssignmentType === "SA") {
      tempAssignmentType = "Summative Assessments";
    }

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

    const checkAndSetWeight = (
      type: string,
      weight: number | undefined,
      setWeight: (value: number) => void
    ) => {
      if (weight === 0) {
        Alert.prompt(
          "Missing Weight",
          `Please enter a weight for ${type} out of 100, then re-edit your grade:`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () =>
                setAddingError("Assignment type weight is required"),
            },
            {
              text: "OK",
              onPress: (input) => {
                const parsedWeight = Number.parseFloat(input);
                if (isNaN(parsedWeight) || parsedWeight <= 0) {
                  setAddingError("Please input a valid weight.");
                } else {
                  setWeight(parsedWeight);
                }
              },
            },
          ],
          "plain-text"
        );
        return false;
      }
      return true;
    };

    // Check each type and prompt for a weight if missing
    if (
      addAssignmentType === "Checking for Understanding" &&
      !checkAndSetWeight(
        "Checking for Understanding",
        selectedCourse?.cfuPercent,
        (weight) => {
          selectedCourse!.cfuPercent = weight;
        }
      )
    ) {
      return false;
    } else if (
      addAssignmentType === "Relevant Applications" &&
      !checkAndSetWeight(
        "Relevant Applications",
        selectedCourse?.raPercent,
        (weight) => {
          selectedCourse!.raPercent = weight;
        }
      )
    ) {
      return false;
    } else if (
      addAssignmentType === "Summative Assessments" &&
      !checkAndSetWeight(
        "Summative Assessments",
        selectedCourse?.saPercent,
        (weight) => {
          selectedCourse!.saPercent = weight;
        }
      )
    ) {
      return false;
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

    return true;
  }

  function ResetCalculator() {
    setSelectedCourse(originalCourse?.copy());
  }
  const getButtonColor = (type: string) => {
    switch (type) {
      case "CFU":
        return Colors.cfuColor;
      case "RA":
        return Colors.raColor;
      case "SA":
        return Colors.saColor;
      default:
        return "#494547";
    }
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: "#1b1b1b",
        height: "100%",
      }}
    >
      <View style={{ flex: 1, padding: 3 }}>
        {selectedCourse && (
          <View style={{ flex: 1 }}>
            {renderHeader()}
            <View
              style={{
                backgroundColor: Colors.gradesCurvedView,
                marginBottom: 300,
                marginLeft: 7,
                marginRight: 7,
                borderRadius: 15,
                paddingBottom: 10,
              }}
            >
              <FlatList
                data={selectedCourse.grades}
                renderItem={renderGradeItem}
                showsVerticalScrollIndicator={false}
                //              nestedScrollEnabled={true} // If it's nested inside another ScrollView
              />
            </View>
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
              borderColor: Colors.tabActiveTint,
              borderWidth: 3,
              height: 550,
              marginHorizontal: 10,
              backgroundColor: "#1c1c1c",
              borderRadius: 20,
              padding: 20,
            }}
          >
            {/* Tab Bar Merged into Button */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 20,
                backgroundColor: "#494547",
                borderRadius: 16,
                borderColor: "#b3b3b3",
                borderWidth: 1,
                padding: 5,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor:
                    selectedTab === "addAssignment"
                      ? Colors.tabActiveTint
                      : Colors.tabBarBG,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => setSelectedTab("addAssignment")}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Add Assignment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  backgroundColor:
                    selectedTab === "whatDoINeed"
                      ? Colors.tabActiveTint
                      : Colors.tabBarBG,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => setSelectedTab("whatDoINeed")}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  What Do I Need
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {selectedTab === "addAssignment" ? (
              <>
                <TextInput
                  style={[
                    styles.infoInput,
                    {
                      height: 10,
                      paddingHorizontal: 10,
                      textAlignVertical: "center",
                      color: "white",
                      marginBottom: 5,
                    },
                  ]} // Remove paddingBottom and add marginBottom
                  placeholder="Assignment Name"
                  placeholderTextColor={"grey"}
                  value={addAssignmentName}
                  onChangeText={setAddAssignmentName}
                />

                <TextInput
                  style={[
                    styles.gradeInfoInput,
                    {
                      height: 10,
                      paddingHorizontal: 10,
                      textAlignVertical: "top",
                      color: "white",
                      marginBottom: 5,
                    },
                  ]} // Move grade here and condense
                  placeholder="Grade"
                  placeholderTextColor={"grey"}
                  keyboardType="decimal-pad"
                  value={addAssignmentGrade}
                  onChangeText={setAddAssignmentGrade}
                />

                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  {/* Assignment type buttons */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      marginBottom: 5,
                    }}
                  >
                    {assignmentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setAddAssignmentType(type.label);
                          setSelectedType(type);
                        }}
                        style={{
                          flex: 1,
                          marginHorizontal: 5,
                          paddingVertical: 7,
                          paddingHorizontal: 3,
                          borderWidth: 2,
                          borderColor:
                            selectedType?.id === type.id
                              ? "white"
                              : "transparent", // White outline for selected
                          borderRadius: 25,
                          backgroundColor:
                            selectedType?.id === type.id
                              ? getColorByType(type.label)
                              : getColorByType(type.label, false), // Function to get appropriate color
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {addingError && addingError !== "" && (
                  <Text style={styles.error}>{addingError}</Text>
                )}

                {/* Add Assignment Button */}
                <View style={{ marginTop: 10, alignItems: "center" }}>
                  <TouchableOpacity
                    style={{
                      padding: 15,
                      borderRadius: 10,
                      backgroundColor: Colors.tabActiveTint,
                      width: "100%",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (AddNewAssignment()) {
                        setVisibleAddAssignment(false);
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      Add Assignment
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // What Do I Need Tab Content
              <>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      marginTop: 20,
                      marginBottom: 20,
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    Desired Grade
                  </Text>

                  {/* Grade Options */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {["90", "80", "70"].map((grade) => {
                      let backgroundColor;
                      if (desiredGrade === grade) {
                        switch (grade) {
                          case "90":
                            backgroundColor = Colors.courseGradeAColor;
                            break;
                          case "80":
                            backgroundColor = Colors.courseGradeBColor;
                            break;
                          case "70":
                            backgroundColor = Colors.courseGradeCColor;
                            break;
                          default:
                            backgroundColor = "#494547";
                        }
                      } else {
                        backgroundColor = "#494547";
                      }

                      return (
                        <TouchableOpacity
                          key={grade}
                          onPress={() => setDesiredGrade(grade)}
                          style={{
                            borderWidth: 2,
                            borderColor:
                              desiredGrade === grade ? "white" : "transparent",
                            borderRadius: 25,
                            marginHorizontal: 5,
                            paddingVertical: 2,
                            width: "10%",
                            backgroundColor: backgroundColor,
                            flex: 1,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              textAlign: "center",
                              verticalAlign: "middle",
                              fontSize: 17,
                              fontWeight: "bold",
                            }}
                          >
                            {grade}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Custom Grade */}
                  <View
                    style={{ flexDirection: "row", width: "100%", padding: 20 }}
                  >
                    <TouchableOpacity
                      style={{
                        padding: 15,
                        borderWidth: 2,
                        borderRadius: 17,
                        backgroundColor: "#494547",
                        alignItems: "center",
                        width: "60%",
                        height: 50,
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          color: "white",
                          textAlign: "center",
                          width: "100%",
                          padding: 0,
                          fontSize: 17,
                          fontWeight: "bold",
                        }}
                        placeholder="Custom Grade"
                        placeholderTextColor="grey"
                        keyboardType="decimal-pad"
                        value={customGrade}
                        onChangeText={(text) => {
                          setCustomGrade(text);
                          setDesiredGrade(text ? text : "");
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      color: "white",
                      marginTop: 20,
                      marginBottom: 20,
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    Grade Type
                  </Text>

                  {/* Category Options */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {["CFU", "RA", "SA"].map((cat) => {
                      let backgroundColor;
                      if (desiredCategory === cat) {
                        switch (cat) {
                          case "CFU":
                            backgroundColor = Colors.cfuColor;
                            break;
                          case "RA":
                            backgroundColor = Colors.raColor;
                            break;
                          case "SA":
                            backgroundColor = Colors.saColor;
                            break;
                          default:
                            backgroundColor = "#494547";
                        }
                      } else {
                        backgroundColor = "#494547";
                      }

                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setDesiredCategory(cat)}
                          style={{
                            borderWidth: 2,
                            borderColor:
                              desiredCategory === cat ? "white" : "transparent",
                            borderRadius: 25,
                            marginHorizontal: 5,
                            paddingVertical: 2,
                            width: "30%",
                            backgroundColor: backgroundColor,
                            flex: 1,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              textAlign: "center",
                              verticalAlign: "middle",
                              fontSize: 17,
                              fontWeight: "bold",
                            }}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Required Grade Section */}
                  <View style={{ marginTop: 20 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 28,
                        fontWeight: "bold",
                      }}
                    >
                      Required Grade
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 22,
                        textAlign: "center",
                        marginTop: 8,
                        marginBottom: 8,
                      }}
                    >
                      {neededScore(
                        selectedCourse,
                        parseFloat(desiredGrade),
                        desiredCategory
                      )?.toString() ??
                        "You need at least one pre-existing grade in this category to make a calculation."}
                    </Text>

                    {/* Conditional Message */}
                    {neededScore(
                      selectedCourse,
                      parseFloat(desiredGrade),
                      desiredCategory
                    ) != null && (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          textAlign: "center",
                          marginTop: 10,
                        }}
                      >
                        {neededScore(
                          selectedCourse,
                          parseFloat(desiredGrade),
                          desiredCategory
                        )! > 100
                          ? "Uh oh..."
                          : neededScore(
                              selectedCourse,
                              parseFloat(desiredGrade),
                              desiredCategory
                            )! < 0
                          ? "You're in good hands."
                          : "You got this!"}
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
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
              borderColor: "#0D92F4",
              borderWidth: 3,
              height: 500,
              marginHorizontal: 10,
              backgroundColor: "#1c1c1c",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 25,

                marginTop: 20,
                textAlign: "center",
                alignSelf: "center",
                marginBottom: 14,
                width: "90%",
                fontWeight: "bold",
              }}
            >
              {addAssignmentName}
            </Text>

            <Text
              style={{
                fontSize: 17,
                color: "white", // Lighter color for date
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {selectedGrade?.date.toLocaleDateString()}
            </Text>

            <AutoCompleteTextInput
              style={styles.textInput}
              onChangeText={setAddAssignmentType}
              value={addAssignmentType}
              keyboardType="default"
              placeholder="Assignment Type..."
              placeholderTextColor="white"
              possibleInputs={
                new Array(
                  "Summative Assessments",
                  "Relevant Applications",
                  "Checking for Understanding"
                )
              }
            />
            <View style={styles.infoBox}>
              <Ionicons
                name="bulb-outline"
                size={20}
                color="#f4c60d"
                style={{ paddingRight: 3 }}
              />
              <Text style={styles.infoText}>Tap to edit</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between", // Adjust space between columns
                padding: 10, // Optional padding for better appearance
                marginTop: 15,
              }}
            >
              <View style={styles.column}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 17,
                    marginBottom: 15,
                    textAlign: "center",
                    alignSelf: "center",
                    fontWeight: "bold",
                  }}
                >
                  Score
                </Text>

                <View
                  style={{
                    backgroundColor: "#0D92F4",
                    padding: 15,
                    paddingHorizontal: 20,
                    width: "90%",
                    flexDirection: "row",
                    alignSelf: "center",
                    alignContent: "center",
                    justifyContent: "space-between",
                    borderRadius: 13,
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color="#ffffff" />

                  <TextInput
                    style={{
                      color: "white",
                      fontSize: 17,
                      alignSelf: "center",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginRight: 10,
                    }}
                    placeholder="---"
                    placeholderTextColor={"white"}
                    keyboardType="decimal-pad"
                    value={addAssignmentGrade}
                    onChangeText={setAddAssignmentGrade}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 17,
                    marginBottom: 15,

                    textAlign: "center",
                    alignSelf: "center",
                    fontWeight: "bold",
                  }}
                >
                  Max Points
                </Text>
                <View
                  style={{
                    backgroundColor: "#0D92F4",
                    padding: 15,
                    paddingHorizontal: 20,
                    width: "90%",
                    alignContent: "center",
                    alignItems: "center",
                    alignSelf: "center",
                    borderRadius: 13,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 18,
                      alignSelf: "center",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {selectedGrade?.maxGrade}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.infoBox, { marginTop: -18 }]}>
              <Ionicons
                name="bulb-outline"
                size={20}
                color="#f4c60d"
                style={{ paddingRight: 3 }}
              />
              <Text style={styles.infoText}>Tap to edit</Text>
            </View>
            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 10 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                  marginTop: 15,
                  borderTopColor: "white",
                  borderTopWidth: 2,
                  paddingTop: 18,
                  marginHorizontal: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignContent: "center",
                    paddingHorizontal: 20,
                    borderRadius: 15,
                    padding: 10,
                    alignItems: "center",
                    width: "48%",
                    backgroundColor: Colors.gradeGradeFailColor,
                  }}
                  onPress={() => {
                    selectedCourse?.deleteAssignment(selectedGrade);
                    setLookingAtAssignmentOptions(false);
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 17,
                      fontWeight: "bold",
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    alignContent: "center",
                    paddingHorizontal: 20,
                    borderRadius: 15,
                    padding: 10,
                    alignItems: "center",
                    width: "48%",
                    backgroundColor: Colors.gradeGradeAColor,
                  }}
                  onPress={() => {
                    if (SaveAssignmentEdits()) {
                      setLookingAtAssignmentOptions(false);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 17,
                      fontWeight: "bold",
                      alignItems: "center",
                    }}
                  >
                    Save
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
    width: "80%",
    backgroundColor: "#0D92F4",
    borderRadius: 25,
    padding: 15,
    color: "#ffffff",
    alignSelf: "center",
    textAlign: "center",
  },
  gradeInfoInput: {
    color: "white",
    fontSize: 25,
    //marginVertical: -20,
    //paddingBottom: 3,
    alignSelf: "center",
    height: 20,
    width: 90,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  infoInput: {
    color: "white",
    fontSize: 25,
    marginBottom: 5,
    marginTop: 20,
    textAlign: "center",
    paddingBottom: 3,
    alignSelf: "center",
    width: 300,
    fontWeight: "bold",
    flex: 1,
  },

  infotype: {
    color: "white",
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginBottom: 5,

    marginTop: 5,
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
  column: {
    flex: 1, // This makes each column take up equal space
    height: 100, // Optional: set a fixed height for each column
  },
  causeWhyNot: {
    borderRadius: 10,
  },
  headerContainer: {
    marginBottom: 10, // Add spacing below the header
    paddingTop: 20, // Add padding to make the header box taller
    //paddingBottom: 10,
    borderBottomWidth: 1, // Border for separating the header from the items
    borderBottomColor: "#444", // Border color
    backgroundColor: "#1c1c1c",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
  },
  headerTitleBox: {
    position: "absolute", // Positioning it freely within the parent container
    left: 0,
    right: 0,
    alignItems: "center", // Center text horizontally within this container
    //backgroundColor: "#0D92F4",
    padding: 10,
    borderRadius: 10,
    //marginBottom: 10,
  },
  headerTitleText: {
    fontSize: 33, // Larger font for the course title
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    width: "80%",
  },
  headerGradeBox: {
    borderRadius: 10, // Rounded corners for the grade box
    justifyContent: "center", // Center the grade text
    alignItems: "center", // Center the grade text horizontally
    height: 140,
    width: 140,
    borderColor: "#0D92F4",
    borderWidth: 3,
    backgroundColor: "white",
  },
  headerGradeText: {
    fontSize: 40, // Larger font for the overall grade
    fontWeight: "bold",
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
    height: 37, // Adjusts the height of the box to fit the content
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
    borderBottomColor: "#858585", // Border color
    backgroundColor: "#2a2a2a",
  },
  assignmentInfo: {
    flex: 1, // Takes up most of the row width
    justifyContent: "flex-start", // Aligns content to the start
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    width: "92%",
    marginBottom: 5,
  },
  assignmentType: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
    //color: "#aaa", // Slightly lighter color for assignment type
  },
  date: {
    fontSize: 13,
    color: "#ffffff", // Lighter color for date
    fontWeight: "bold",
  },
  background: {
    flex: 1,
    resizeMode: "cover", // optional: adjust the image scaling
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
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  back_button: {
    zIndex: 2,
  },
  infoBox: {
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -2,
    flexDirection: "row",
  },
  infoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default gradesCalculating;
