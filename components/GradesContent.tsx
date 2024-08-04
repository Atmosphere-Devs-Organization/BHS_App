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

interface Props {
  category: string;
}

const GradesContent = ({ category }: Props) => {
  const HAC_Link = "https://home-access.cfisd.net";
  const User = "s184491";
  const Pass = "Gabby2007";

  const fetchStudentInfo = async (apiSection: string): Promise<any> => {
    try {
      const response = await axios.get(
        "https://homeaccesscenterapi.vercel.app/api/" +
          apiSection +
          "?link=" +
          HAC_Link +
          "/&user=" +
          User +
          "&pass=" +
          Pass
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const [transcriptData, setTData] = useState<any>(null);
  //const [gradesData, setGData] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any>([]);

  useEffect(() => {
    if (!transcriptData) {
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
  }, []);

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
      <Text style={{ color: "white" }}>Grades Coming Soon</Text>
    </View>
  );
};

const Calculator = () => {
  return <Text style={{ color: "white" }}>Calculator Coming Soon</Text>;
};

const Transcript = ({
  transcriptData,
  schoolYears,
}: {
  transcriptData: any;
  schoolYears: any;
}) => {
  const [yearItem, setYearItem] = useState<any>(null);
  const [showingTranscriptDetails, setShowingDetails] =
    useState<boolean>(false);

  const printDataArray = (array: any[][]): string => {
    let out = "";
    for (let i = 1; i < (array ? array.length : 0); i++) {
      out += "- " + array[i] + "\n\n";
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
          color: Colors.transcriptBubbleText,
          marginVertical: 10,
          fontWeight: "bold",
          fontSize: 30,
          borderWidth: 5,
          borderColor: "#ffffff",
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

  return (
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
              fontSize: 30,
              textAlign: "center",
            }}
          >
            Courses--Descriptions--SEM1--SEM2--Credit
          </Text>
          <ScrollView
            style={{ marginBottom: 560 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: "white",
                paddingVertical: 30,
                paddingHorizontal: 20,
                fontSize: 18,
              }}
            >
              {printDataArray(yearItem.data)}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topText: {
    color: Colors.topText,
    fontSize: 20,
    fontWeight: "bold",
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#ffffff",
    padding: 10,
  },
  close_button: { padding: 10 },
});

export default GradesContent;
