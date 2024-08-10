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

interface Props {
  category: string;
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

  const fetchStudentInfo = async (apiSection: string): Promise<any> => {
    try {
      const response = await axios.get(
        "https://home-access-center-ap-iv2-sooty.vercel.app/api/" +
          apiSection +
          "?link=" +
          HAC_Link +
          "/&user=" +
          username +
          "&pass=" +
          password
      );
      return response.data;
    } catch (error) {
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
        console.log(response);
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
          />
        </View>
      );
    }
  }
};

const Grades = () => {
  return (
    <View>
      <Text style={styles.comingSoonText}>Grades Coming Soon</Text>
    </View>
  );
};

const Calculator = () => {
  return (
    <Text style={styles.comingSoonText}>Calculator Coming Soon</Text>
  );
};

const Transcript = ({
  transcriptData,
  schoolYears,
}: {
  transcriptData: any;
  schoolYears: any[];
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

  return transcriptData !== undefined ? (
    <View>
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
            <ActivityIndicator
              size="large"
              color="#ff4d00"
              style={{ alignSelf: "center", marginTop: 100 }}
            />
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
    <View>
      <Text style={{ color: "white" }}>HAC Info is Incorrect</Text>
    </View>
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
    marginVertical: 20, 
  },
});

export default GradesContent;
