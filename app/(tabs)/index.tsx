import { Stack } from "expo-router";
import CustomGradesHeader from "@/components/CustomGradesHeader";
import GradesContent from "@/components/GradesContent";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Linking,
  Alert,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  refreshBridgelandStudent,
  refreshGradeData,
} from "@/globalVars/gradesVariables";
import axios from "axios";
import * as Application from "expo-application";
import { useIsFocused } from "@react-navigation/native";

const screenHeight = Dimensions.get("window").height;

const Grades = () => {
  const [category, setCategory] = useState("Grades");
  const [sid, setSid] = useState("");
  const [HACpassword, setHACPassword] = useState("");

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchUserData = async () => {
        setSid((await SecureStore.getItemAsync("HACusername")) || "");
        setHACPassword((await SecureStore.getItemAsync("HACpassword")) || "");
      };

      fetchUserData();
    }
  }, [isFocused]);


  useEffect(() => {
    refreshGradeData(sid, HACpassword);
    refreshBridgelandStudent(sid, HACpassword);
  }, [sid, HACpassword]);

  const checkForUpdate = async () => {
    try {
      const currentVersion = Application.nativeApplicationVersion;

      let storeVersion;
      if (Platform.OS === "ios") {
        // Fetch version from Apple App Store
        const response = await axios.get(
          `https://itunes.apple.com/lookup?bundleId=${Application.applicationId}`
        );
        storeVersion = response.data.results[0].version;
      } else if (Platform.OS === "android") {
        // You can either get the version from the Play Store API or your server.
        // This example assumes the version is fetched from your server.
        const response = await axios.get(
          `https://your-server.com/latest-android-version`
        );
        storeVersion = response.data.version;
      }
      console.log("current");
      console.log(currentVersion);
      console.log("app store");
      console.log(storeVersion);

      if (storeVersion && currentVersion !== storeVersion) {
        // Show an alert to update the app
        Alert.alert(
          "Update Available",
          "Please update the app to the latest version from the store.",
          [
            {
              text: "Update",
              onPress: () => {
                const url =
                  Platform.OS === "ios"
                    ? "itms-apps://itunes.apple.com/app/6630367027"
                    : "market://details?id=YOUR_PACKAGE_NAME";
                Linking.openURL(url);
              },
            },
            {
              text: "Cancel",
              onPress: () => console.log("Update cancelled"),
              style: "cancel",  // Optional, adds a visual cue that this is a cancel action
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to check app version:", error);
    }
  };

  return (
    <View style={styles.BG_Color}>
      <Stack.Screen
        options={{
          header: () => <CustomGradesHeader onCategoryChanged={setCategory} />,
        }}
      />
      <View style={{ flex: 1, marginTop: screenHeight * 0.15 }}>
        <GradesContent category={category} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
  },
});

export default Grades;
