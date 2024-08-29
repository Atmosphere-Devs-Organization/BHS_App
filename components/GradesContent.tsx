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
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import HACNeededScreen from "./HACNeededScreen";

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
}

const GradesContent = ({ category }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCredentials = async () => {
        const storedUsername = await SecureStore.getItemAsync(
          user?.uid + "HACusername"
        );
        const storedPassword = await SecureStore.getItemAsync(
          user?.uid + "HACpassword"
        );

        setUsername(storedUsername);
        setPassword(storedPassword);
      };

      fetchCredentials();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [user?.uid])
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
  //const [gradesData, setGData] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any>([]);

  useEffect(() => {
    setTData(null);
    if (username && password) {
      async function fetchAPI() {
        let response = await fetchStudentInfo("transcript");
        //let response2 = await fetchStudentInfo("averages");
        setTData(response);
        //setGData(response2);
        const schoolYearArray = Object.keys(response)
          .filter((key) => key.includes("School Year"))
          .map((key) => ({
            key,
            ...response[key],
          }));
        setSchoolYears(schoolYearArray);
      }

      fetchAPI();
    }
  }, [username, password]);

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
          <Grades />
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
          <Calculator />
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
            user={user}
            hacBroken={HACBroken}
          />
        </View>
      );
    }
  }
};

const Grades = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Simulated data fetch - replace with actual API call
  useEffect(() => {
    const fetchCourses = async () => {
      // Simulated API response
      const coursesData: Course[] = [
        new Course("Physics C", 101, [
          new Grade("Homework", "Linear Equations", 95, new Date("2024-08-15")),
          new Grade("Relative Applications", "The Are You GAY Quiz", 99, new Date("2024-08-20")),
          new Grade("Summatives", "All about the LGBTQ Community :(", 69, new Date("2024-08-15")),

        ]),
        new Course("AP Chem", 90, [
          new Grade("Relative Applications", "Cell Structure", 91, new Date("2024-08-18")),
          new Grade("Summatives", "Chemistry Fundamentals", 87, new Date("2024-08-25")),
          new Grade("Homework", "AP Classroom", 97, new Date("2024-08-18")),
          new Grade("Summatives", "Biology Fundamentals cause", 42, new Date("2024-08-25")),

        ]),
        new Course("Calculus III", 92, [
          new Grade("Homework", "Linear Equations", 95, new Date("2024-08-15")),
          new Grade("Quiz", "Algebra Basics", 88, new Date("2024-08-20")),
        ]),
        new Course("Computer Science IV", 95, [
          new Grade("Lab Report", "Cell Structure", 91, new Date("2024-08-18")),
          new Grade("Test", "Chemistry Fundamentals", 87, new Date("2024-08-25")),
        ]),
        
        // Add more courses as needed
      ];
      setCourses(coursesData);
    };

    fetchCourses();
  }, []);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => setSelectedCourse(item)}
    >
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseGrade}>{item.overallGrade}%</Text>
    </TouchableOpacity>
  );

  const renderGradeItem = ({ item }: { item: Grade }) => (
    <View style={styles.gradeItem}>
      <Text style={styles.assignmentName}>{item.assignmentName}</Text>
      <Text style={styles.assignmentType}>{item.assignmentType}</Text>
      <Text style={styles.grade}>{item.grade}%</Text>
      <Text style={styles.date}>{item.date.toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {!selectedCourse ? (
        <>
          <Text style={styles.header}>Your Courses</Text>
          <FlatList
            data={courses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.name}
          />
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCourse(null)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back to Courses</Text>
          </TouchableOpacity>
          <Text style={styles.header}>{selectedCourse.name} Grades</Text>
          <FlatList
            data={selectedCourse.grades}
            renderItem={renderGradeItem}
            keyExtractor={(item) => item.assignmentName}
          />
        </>
      )}
    </View>
  );
};


const Calculator = () => {
  return <Text style={styles.comingSoonText}>Calculator Coming Soon</Text>;
};

const Transcript = ({
  transcriptData,
  schoolYears,
  user,
  hacBroken,
}: {
  transcriptData: any;
  schoolYears: any[];
  user: any;
  hacBroken: boolean;
}) => {
  const [yearItem, setYearItem] = useState<any>(null);
  const [showingTranscriptDetails, setShowingDetails] =
    useState<boolean>(false);

  schoolYears = schoolYears.reverse();

  const printSingleTranscriptEntry = (array: any[]): string => {
    return (
      array[1] +
      (array[2] == "" ? "" : ", SEM1: " + array[2]) +
      (array[3] == "" ? "" : ", SEM2: " + array[3]) +
      ", " +
      array[4]
    );
  };
  const printTranscriptArray = (array: any[][]): string => {
    array.sort((a, b) => {
      let comp = String(a[1]).localeCompare(String(b[1]));
      return comp !== 0 ? comp : String(a[0]).localeCompare(String(b[0]));
    });
    let out = "";
    for (let i = 0; i < (array ? array.length : 0); i++) {
      if (String(array[i][0]) !== "Course") {
        out +=
          "- " +
          printSingleTranscriptEntry(array[i]) +
          (i === array.length - 1
            ? ""
            : String(array[i][1]).toUpperCase() ===
              String(array[i + 1][1]).toUpperCase()
            ? "\n"
            : "\n\n");
      }
    }
    return out;
  };
  const renderRow: ListRenderItem<any> = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setYearItem(item);
        setShowingDetails(true);
      }}
    >
      <Text
        style={{
          color: "white",
          marginVertical: 10,
          fontWeight: "bold",
          fontSize: 30,
          borderWidth: 5,
          borderColor: "#2176ff",
          padding: 40,
          textAlign: "center",
          borderRadius: 15,
          marginHorizontal: 15,
          backgroundColor: Colors.transcriptBubblesBG,
          fontFamily: "Oswald",
          textShadowColor: "#ffffff30",
          textShadowOffset: { width: -1, height: -1 },
          textShadowRadius: 10,
          elevation: 2,
        }}
      >
        {item.year}
      </Text>
    </TouchableOpacity>
  );

  const listRef = useRef<FlatList>(null);

  return user && transcriptData !== undefined ? (
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
              borderColor: "#fff",
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
              style={{ marginTop: 30, marginBottom: 350 }}
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
                If transcript isn't loading, check that you've entered your HAC
                info correctly on profile
              </Text>
            </View>
          )}
        </View>
      )}
      {showingTranscriptDetails && (
        <View>
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
              color: "#ff4d00",
              paddingVertical: 20,
              alignSelf: "center",
              fontSize: 35,
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "Oswald",
            }}
          >
            {yearItem.year}
          </Text>
          <ScrollView
            style={{ marginBottom: 510 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: "white",
                paddingVertical: 30,
                paddingHorizontal: 25,
                fontSize: 19,
              }}
            >
              {printTranscriptArray(yearItem.data)}
            </Text>
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
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ffffff",
    padding: 10,
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.transcriptBubblesBG,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    height: 100,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  courseGrade: {
    fontSize: 24,
    color: Colors.tabActiveTint,
    fontWeight: 'bold',
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  gradeItem: {
    backgroundColor: Colors.transcriptBubblesBG,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  assignmentType: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  grade: {
      fontSize: 24,
      color: 'white',
      textAlign: 'right',
    },
  date: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },

});

export default GradesContent;
