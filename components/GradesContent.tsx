import {
  View,
  Text,
  StyleSheet,
  ListRenderItem,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import HACNeededScreen from "./HACNeededScreen";
import CourseCard from "./CourseCard"; // Adjust the import path as necessary
import CalculatorPage from "./CalculatorPage";
import {
  calculateAssignmentTypePercentages,
  Course,
  getCourses,
  Grade,
} from "@/globalVars/gradesVariables";
import Numbers from "@/constants/Numbers";
import { Link, router } from "expo-router";

interface Props {
  category: string;
}
const screenHeight = Dimensions.get("window").height;

const GradesContent = ({ category }: Props) => {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCredentials = async () => {
        const storedUsername = await SecureStore.getItemAsync("HACusername");
        const storedPassword = await SecureStore.getItemAsync("HACpassword");

        setUsername(storedUsername);
        setPassword(storedPassword);
      };

      fetchCredentials();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  const HAC_Link = "https://home-access.cfisd.net";

  let specCharsMap = new Map<string | undefined, string>();
  specCharsMap.set(" ", "%20");
  specCharsMap.set("#", "%23");
  specCharsMap.set("&", "%26");
  specCharsMap.set("/", "%2F");
  specCharsMap.set("?", "%3F");
  specCharsMap.set("!", "%21");
  specCharsMap.set("$", "%24");
  specCharsMap.set("@", "%40");

  const [HACBroken, setHACBroken] = useState<boolean>(false);

  const fetchStudentInfo = async (apiSection: string): Promise<any> => {
    let tempPassword = "";
    for (let i = 0; i < (password ? password.length : 0); i++) {
      tempPassword += specCharsMap.has(password?.substring(i, i + 1))
        ? specCharsMap.get(password?.substring(i, i + 1))
        : password?.substring(i, i + 1);
    }

    const apiLink =
      "https://home-access-center-ap-iv2-sooty.vercel.app/api/" +
      apiSection +
      "?link=" +
      HAC_Link +
      "/&user=" +
      username +
      "&pass=" +
      tempPassword;

    try {
      const response = await axios.get(apiLink);
      setHACBroken(false);
      return response.data;
    } catch (error) {
      setHACBroken(error == "AxiosError: Request failed with status code 500");
      return undefined;
    }
  };

  const [transcriptData, setTData] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any>([]);

  useEffect(() => {
    setTData(null);
    if (username && password) {
      async function fetchAPI() {
        let response = await fetchStudentInfo("transcript");
        setTData(response);

        if (response) {
          const schoolYearArray = Object.keys(response)
            .filter((key) => key.includes("School Year"))
            .map((key) => ({
              key,
              ...response[key],
            }));
          setSchoolYears(schoolYearArray.reverse());
        }
      }

      fetchAPI();
    }
  }, [username, password]);

  const [courses, setCourses] = useState<Course[] | null | undefined>(null);
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
    }
  }, [courses]);

  switch (category) {
    case "Grades": {
      return (
        <View>
          <StatusBar
            animated={true}
            barStyle="light-content"
            showHideTransition="slide"
            hidden={false}
          />
          <Grades hacBroken={HACBroken} courses={courses} />
        </View>
      );
    }
    case "Tools": {
      return (
        <View>
          <StatusBar
            animated={true}
            barStyle="light-content"
            showHideTransition="slide"
            hidden={false}
          />
          <CalculatorPage hacBroken={HACBroken} courses={courses} />
        </View>
      );
    }
    case "Transcript": {
      return (
        <View>
          <StatusBar
            animated={true}
            barStyle="light-content"
            showHideTransition="slide"
            hidden={false}
          />
          <Transcript
            transcriptData={transcriptData}
            schoolYears={schoolYears}
            hacBroken={HACBroken}
          />
        </View>
      );
    }
  }
};

const Grades = ({
  hacBroken,
  courses,
}: {
  hacBroken: boolean;
  courses: Course[] | null | undefined;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

    return (
      <View style={styles.causeWhyNot}>
        <TouchableOpacity
          style={styles.courseItem} // Keep the existing styles for the main container
          onPress={() =>
            router.push({
              pathname: "/(screens)/gradesCalculating",
              params: {
                className: item ? item.name : "Dan",
              },
            })
          }
        >
          <Text style={styles.courseName}>{item.name}</Text>
          {/* Wrap the Text component in a View to handle background and border styling */}
          <View style={[styles.gradeContainer, { backgroundColor }]}>
            <Text style={styles.courseGrade}>
              {item.overallGrade == -100
                ? "N/A"
                : Math.round(item.overallGrade) + "%"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const formatGrade = (grade: number) => {
    if (grade === -100) return "N/A";
    return grade >= 100 ? `${grade}.0` : `${grade.toFixed(2)}`;
  };
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
      </View>
    );
  };

  return courses !== undefined ? (
    <View style={styles.container}>
      {courses !== null ? (
        <View style={{ paddingTop: 20, marginTop: screenHeight * 0.06 }}>
          <FlatList
            data={courses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }} // Add padding at the bottom
          />
        </View>
      ) : (
        <View>
          <ActivityIndicator
            size="large"
            color="#0D92F4"
            style={{ alignSelf: "center", marginTop: 100 }}
          />
          <Text
            style={{
              color: "white",
              alignSelf: "center",
              paddingVertical: 40,
              textAlign: "center",
              paddingHorizontal: 20,
              fontSize: 16,
            }}
          >
            Just a moment... magic takes time
          </Text>
        </View>
      )}
    </View>
  ) : (
    <HACNeededScreen paddingTop={0} hacDown={hacBroken} />
  );
};

const Transcript = ({
  transcriptData,
  schoolYears,
  hacBroken,
}: {
  transcriptData: any;
  schoolYears: any[];
  hacBroken: boolean;
}) => {
  const [yearItem, setYearItem] = useState<any>(null);
  const [showingTranscriptDetails, setShowingDetails] =
    useState<boolean>(false);

  const printTranscriptArray = (array: any[]) => {
    // Create an object to aggregate course data
    const courseData: {
      [key: string]: { sem1Grade: string; sem2Grade: string };
    } = {};

    // Process the array to format the data
    array.forEach((item) => {
      if (item[0] !== "Course") {
        // Assuming the first row contains column headers
        const courseName = item[1];
        const sem1Grade = item[2] || "-";
        const sem2Grade = item[3] || "-";

        // If the course already exists, update the grades
        if (courseData[courseName]) {
          courseData[courseName].sem1Grade =
            courseData[courseName].sem1Grade === "-"
              ? sem1Grade
              : courseData[courseName].sem1Grade;
          courseData[courseName].sem2Grade =
            courseData[courseName].sem2Grade === "-"
              ? sem2Grade
              : courseData[courseName].sem2Grade;
        } else {
          courseData[courseName] = { sem1Grade, sem2Grade };
        }
      }
    });

    // Convert the aggregated data into an array for rendering
    const courses = Object.keys(courseData).map((courseName) => ({
      courseName,
      sem1Grade: courseData[courseName].sem1Grade,
      sem2Grade: courseData[courseName].sem2Grade,
    }));

    return (
      <View>
        <ScrollView
          style={{ flex: 1, padding: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <CourseCard courses={courses} />
        </ScrollView>
      </View>
    );
  };

  const renderRow: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity
      style={{
        alignContent: "center",
        borderWidth: 2,
        padding: 35 ,
        borderRadius: 25,
        backgroundColor: Colors.transcriptBubblesBG,
        borderColor: Colors.tabActiveTint,
        marginBottom: 10,
        width: "95%",
        marginLeft: 10,
        marginRight: 10,
      }}
      onPress={() => {
        setYearItem(item);
        setShowingDetails(true);
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          alignContent: "center",
          textAlignVertical: "center",
          fontSize: 25,
          textAlign: "center",
        }}
      >
        {item.year}
      </Text>
    </TouchableOpacity>
  );

  const listRef = useRef<FlatList>(null);

  return transcriptData !== undefined ? (
    <View style={{ paddingTop: 30, marginTop: 15 }}>
      {!showingTranscriptDetails && (
        <View style={{marginTop: 40}}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 17,
              marginHorizontal: 13,
              paddingTop: 5,
              paddingBottom: 10,
            }}
          >
            <Text style={styles.topText}>
              GPA:{" "}
              {transcriptData !== null
                ? "" + transcriptData["Cumulative GPA"]
                : "Loading..."}
            </Text>
            <Text style={styles.topText}>
              Rank:{" "}
              {transcriptData !== null
                ? "" + transcriptData["rank"]
                : "Loading..."}
            </Text>
          </View>
          {transcriptData !== null ? (
            <FlatList
              data={schoolYears}
              ref={listRef}
              renderItem={renderRow}
              style={{ marginTop: 30, marginBottom: 370 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View>
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={{ alignSelf: "center", marginTop: 100 }}
              />
              <Text
                style={{
                  color: Colors.primary,
                  alignSelf: "center",
                  paddingVertical: 40,
                  textAlign: "center",
                  paddingHorizontal: 20,
                  fontSize: 16,
                }}
              >
                Make sure you aren't connected to school wifi
              </Text>
            </View>
          )}
        </View>
      )}
      {showingTranscriptDetails && (
        <View style={{ height: "100%", marginTop: 30}}>
          <TouchableOpacity
            onPress={() => {
              setShowingDetails(false);
            }}
            style={styles.close_button}
          >
            <Ionicons name="arrow-back-circle-outline" size={30} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              paddingHorizontal: 10,
              alignSelf: "center",
              fontSize: 35,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {yearItem.year}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 100 }}
          >
            <Text>{printTranscriptArray(yearItem.data)}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  ) : (
    <HACNeededScreen paddingTop={0} hacDown={hacBroken} />
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
    borderColor: Colors.tabActiveTint,
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
    backgroundColor: "#121212", // Dark background for better contrast
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
    padding: 10, // Reduced padding
    height: 80, // Decreased height for thinner boxes
    borderRadius: 10, // Slightly adjusted radius for consistency
    marginBottom: 10,
    margin: 3,
    backgroundColor: "#2a2a2a",
    borderColor: "#858585",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1, // Adjusted shadow height for thinner appearance
    },
    shadowOpacity: 0.1,
    shadowRadius: 2, // Reduced shadow radius
    elevation: 2, // Reduced elevation for thinner look
  },
  courseName: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  causeWhyNot: {
    borderRadius: 10,
  },
  headerContainer: {
    marginBottom: 20,
    paddingTop: 5,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  headerTitleBox: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCalcButtonBox: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "flex-end",
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerGradeBox: {
    borderRadius: 8, // Adjusted radius
    justifyContent: "center",
    alignItems: "center",
    height: 70, // Decreased height for a thinner box
    width: 120, // You can adjust width as needed
    borderWidth: 2,
    borderColor: Colors.gradeBoxBorder,
    backgroundColor: "#3c3b3c",
  },
  headerGradeText: {
    fontSize: 32, // Larger font for better visibility
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
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: 55,
  },
  courseGrade: {
    fontSize: 22, // Slightly larger for clarity
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    gap: 10,
  },
  assignmentInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 3,
    flex: 1,
  },
  assignmentText: {
    color: "white",
    padding: 10,
    fontSize: 16,
  },
  assignmentType: {
    fontSize: 14,
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  gradeBox: {
    borderRadius: 10,
    borderWidth: 1, // Adjusted border width
    borderColor: Colors.gradeBoxBorder,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10, // Reduced vertical padding
    width: 80,
    minWidth: 60,
    backgroundColor: "#3c3b3c",
  },
  gradeText: {
    fontSize: 20, // Adjusted for better visibility
    fontWeight: "bold",
    color: "white",
  },
  back_button: {
    zIndex: 2,
  },
});

export default GradesContent;
