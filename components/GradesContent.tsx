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

interface Props {
  category: string;
}

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
  const [gradesData, setGData] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any>([]);

  useEffect(() => {
    setTData(null);
    setGData(null);
    if (username && password) {
      async function fetchAPI() {
        let response = await fetchStudentInfo("transcript");
        let response2 = await fetchStudentInfo("assignments");
        setTData(response);
        setGData(response2);

        const schoolYearArray = Object.keys(response)
          .filter((key) => key.includes("School Year"))
          .map((key) => ({
            key,
            ...response[key],
          }));
        setSchoolYears(schoolYearArray.reverse());
      }

      fetchAPI();
    }
  }, [username, password]);

  const [courses, setCourses] = useState<Course[] | null>(null);

  // Simulated data fetch - replace with actual API call
  useEffect(() => {
    const fetchCourses = async () => {
      // Simulated API response
      const coursesData: Course[] = [];

      if (gradesData) {
        let i = 0;
        const classesArray = Object.keys(gradesData);
        classesArray.forEach(function (value) {
          if (value.indexOf("dropped") == -1) {
            let grade = Number.parseInt(gradesData[value]["average"]);
            coursesData[i] = new Course(
              value.split(" - ")[1].split(" Marking")[0].substring(2),
              grade ? grade : -100,
              []
            );

            let assignmentsArr = gradesData[value]["assignments"];
            assignmentsArr.forEach(function (assignment: any[]) {
              let assignmentGrade = Number.parseInt(assignment[3]);
              let dateArr = assignment[1].split("/");

              coursesData[i].addAssignment(
                new Grade(
                  assignment[2],
                  assignment[0],
                  assignmentGrade ? assignmentGrade : -100,
                  new Date(dateArr[2] + "-" + dateArr[0] + "-" + dateArr[1])
                )
              );
            });
            i++;
          }
        });

        //We need to add assignments once api works
        /* coursesData[0].addAssignment(
         new Grade("Homework", "Linear Equations", 95, new Date("2024-08-15"))
      );*/

        setCourses(coursesData);
      }
    };

    fetchCourses();
  }, [gradesData]);

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
          <Grades
            gradesData={gradesData}
            hacBroken={HACBroken}
            courses={courses}
          />
        </View>
      );
    }
    case "Calculator": {
      return (
        <View>
          <StatusBar
            animated={true}
            barStyle="light-content"
            showHideTransition="slide"
            hidden={false}
          />
          <Calculator
            gradesData={gradesData}
            hacBroken={HACBroken}
            courses={courses}
          />
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
  gradesData,
  hacBroken,
  courses,
}: {
  gradesData: any;
  hacBroken: boolean;
  courses: Course[] | null;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => setSelectedCourse(item)}
    >
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseGrade}>
        {item.overallGrade == -100 ? "N/A" : item.overallGrade + "%"}
      </Text>
    </TouchableOpacity>
  );

  const renderGradeItem = ({ item }: { item: Grade }) => (
    <View style={styles.gradeItem}>
      <Text style={styles.assignmentName}>{item.assignmentName}</Text>
      <Text style={styles.assignmentType}>{item.assignmentType}</Text>
      <Text style={styles.grade}>
        {item.grade == -100 ? "N/A" : item.grade + "%"}
      </Text>
      <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>
    </View>
  );

  return gradesData !== undefined ? (
    <View style={styles.container}>
      {courses !== null ? (
        !selectedCourse ? (
          <View style={{ paddingTop: 20 }}>
            <FlatList
              data={courses}
              renderItem={renderCourseItem}
              keyExtractor={(item) => item.name}
            />
          </View>
        ) : (
          <View style={{ marginBottom: 90 }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCourse(null)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text style={styles.backButtonText}>Back to Courses</Text>
            </TouchableOpacity>
            <Text style={styles.header}>
              {selectedCourse.name} Grades:{" "}
              {"\t\t" +
                (selectedCourse.overallGrade == -100
                  ? "N/A"
                  : selectedCourse.overallGrade + "%")}
            </Text>
            <FlatList
              data={selectedCourse.grades}
              renderItem={renderGradeItem}
              keyExtractor={(item) => item.assignmentName}
            />
          </View>
        )
      ) : (
        <View>
          <ActivityIndicator
            size="large"
            color="#ff4d00"
            style={{ alignSelf: "center", marginTop: 100 }}
          />
          <Text
            style={{
              color: "#ff4d00",
              alignSelf: "center",
              paddingVertical: 40,
              textAlign: "center",
              paddingHorizontal: 20,
              fontSize: 16,
            }}
          >
            Make sure you are not on school wifi
          </Text>
        </View>
      )}
    </View>
  ) : (
    <HACNeededScreen paddingTop={0} hacDown={hacBroken} />
  );
};

const Calculator = ({
  gradesData,
  hacBroken,
  courses,
}: {
  gradesData: any;
  hacBroken: boolean;
  courses: Course[] | null;
}) => {
  return (
    <CalculatorPage
      gradesData={gradesData}
      hacBroken={hacBroken}
      courses={courses}
    />
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
    // Group courses by semester
    const semesters: { [key: string]: { course: any; semester: any }[] } = {
      SEM1: [],
      SEM2: [],
    };

    array.forEach((item) => {
      if (item[1] && item[2])
        semesters.SEM1.push({ course: item[1], semester: item[2] });
      if (item[1] && item[3])
        semesters.SEM2.push({ course: item[1], semester: item[3] });
    });

    return (
      <ScrollView
        style={{ flex: 1, padding: 10, minWidth: "400%", marginBottom: 120 }}
      >
        {Object.keys(semesters).map((sem) => (
          <View key={sem}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                marginVertical: 10,
                color: "white",
              }}
            >
              {sem}
            </Text>
            {semesters[sem].map((courseItem, index) => (
              <CourseCard
                key={index}
                course={courseItem.course}
                semester={courseItem.semester}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderRow: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity
      style={{
        alignContent: "center",
        borderWidth: 5,
        padding: 20,
        borderRadius: 15,
        backgroundColor: Colors.transcriptBubblesBG,
        marginBottom: 10,
        width: "95%",
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 50,
        paddingBottom: 50,
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
    <View style={{ paddingTop: 30 }}>
      {!showingTranscriptDetails && (
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 17,
              marginHorizontal: 13,
              borderBottomWidth: 2,
              borderColor: "#ffffff",
              paddingTop: 5,
              paddingBottom: 30,
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
            />
          ) : (
            <View>
              <ActivityIndicator
                size="large"
                color="#ff4d00"
                style={{ alignSelf: "center", marginTop: 100 }}
              />
              <Text
                style={{
                  color: "#ff4d00",
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
        <View style={{ height: "100%" }}>
          <TouchableOpacity
            onPress={() => {
              setShowingDetails(false);
            }}
            style={styles.close_button}
          >
            <Ionicons name="close-sharp" size={24} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              paddingVertical: 20,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.transcriptBubblesBG,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    height: 100,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  courseGrade: {
    fontSize: 24,
    color: Colors.tabActiveTint,
    fontWeight: "bold",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    width: 90,
    textAlign: "center",
  },
  gradeItem: {
    backgroundColor: Colors.transcriptBubblesBG,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  assignmentType: {
    fontSize: 14,
    color: "white",
    marginTop: 5,
  },
  grade: {
    fontSize: 24,
    color: "white",
    textAlign: "right",
  },
  date: {
    fontSize: 14,
    color: "white",
    marginTop: 5,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default GradesContent;
